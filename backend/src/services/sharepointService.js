/**
 * SharePoint Service — Microsoft Graph API integration
 * Uses axios (already installed). No additional packages required.
 *
 * Setup required in .env:
 *   SHAREPOINT_TENANT_ID     — Azure AD tenant ID
 *   SHAREPOINT_CLIENT_ID     — App registration client ID
 *   SHAREPOINT_CLIENT_SECRET — App registration client secret
 *   SHAREPOINT_SITE_URL      — e.g. https://yourcompany.sharepoint.com/sites/Safety
 *   SHAREPOINT_LIBRARY       — Document library name, e.g. "Safety Manager"
 *
 * Azure App Registration permissions needed (Application type, not Delegated):
 *   Sites.ReadWrite.All  OR  Files.ReadWrite.All
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

class SharePointService {
  constructor() {
    this._tokenCache = null;
    this._tokenExpiry = null;
  }

  /**
   * Check whether SharePoint is configured in env
   */
  isConfigured() {
    const { SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET, SHAREPOINT_SITE_URL } = process.env;
    const isPlaceholder = v => !v || v.startsWith('your-') || v === '';
    return (
      !isPlaceholder(SHAREPOINT_TENANT_ID) &&
      !isPlaceholder(SHAREPOINT_CLIENT_ID) &&
      !isPlaceholder(SHAREPOINT_CLIENT_SECRET) &&
      !isPlaceholder(SHAREPOINT_SITE_URL)
    );
  }

  /**
   * Get OAuth2 access token via client credentials flow
   */
  async getAccessToken() {
    // Return cached token if still valid (5 min buffer)
    if (this._tokenCache && this._tokenExpiry && Date.now() < this._tokenExpiry - 300000) {
      return this._tokenCache;
    }

    const tenantId = process.env.SHAREPOINT_TENANT_ID;
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SHAREPOINT_CLIENT_ID,
      client_secret: process.env.SHAREPOINT_CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default',
    });

    const response = await axios.post(tokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    this._tokenCache = response.data.access_token;
    this._tokenExpiry = Date.now() + response.data.expires_in * 1000;
    return this._tokenCache;
  }

  /**
   * Get the SharePoint site ID from the configured site URL
   */
  async getSiteId() {
    if (this._siteId) return this._siteId;

    const token = await this.getAccessToken();
    const siteUrl = new URL(process.env.SHAREPOINT_SITE_URL);
    const hostname = siteUrl.hostname;
    const sitePath = siteUrl.pathname;

    const res = await axios.get(
      `${GRAPH_BASE}/sites/${hostname}:${sitePath}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    this._siteId = res.data.id;
    return this._siteId;
  }

  /**
   * Get the document library drive ID
   */
  async getDriveId() {
    if (this._driveId) return this._driveId;

    const token = await this.getAccessToken();
    const siteId = await this.getSiteId();
    const libraryName = process.env.SHAREPOINT_LIBRARY || 'Safety Manager';

    const res = await axios.get(
      `${GRAPH_BASE}/sites/${siteId}/drives`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const drive = res.data.value.find(
      d => d.name === libraryName || d.name.toLowerCase() === libraryName.toLowerCase()
    );

    if (!drive) {
      throw new Error(`Document library "${libraryName}" not found on SharePoint site`);
    }

    this._driveId = drive.id;
    return this._driveId;
  }

  /**
   * Ensure a folder path exists, creating folders as needed
   * @param {string} folderPath - e.g. "Active/JSA"
   */
  async ensureFolder(folderPath) {
    const token = await this.getAccessToken();
    const driveId = await this.getDriveId();
    const parts = folderPath.split('/').filter(Boolean);

    let currentPath = 'root';
    for (const part of parts) {
      try {
        await axios.get(
          `${GRAPH_BASE}/drives/${driveId}/root:/${currentPath === 'root' ? '' : currentPath + '/'}${part}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        if (err.response?.status === 404) {
          // Create the folder
          const parentPath = currentPath === 'root'
            ? `${GRAPH_BASE}/drives/${driveId}/root/children`
            : `${GRAPH_BASE}/drives/${driveId}/root:/${currentPath}:/children`;

          await axios.post(parentPath, {
            name: part,
            folder: {},
            '@microsoft.graph.conflictBehavior': 'ignore',
          }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        }
      }
      currentPath = currentPath === 'root' ? part : `${currentPath}/${part}`;
    }
  }

  /**
   * Upload a file to SharePoint
   * @param {string} localFilePath - absolute local path to the file
   * @param {string} remoteFolder  - SharePoint folder path e.g. "Active/JSA"
   * @param {string} fileName      - target file name on SharePoint
   * @returns {{ fileId, webUrl }}
   */
  async uploadFile(localFilePath, remoteFolder, fileName) {
    if (!this.isConfigured()) {
      logger.warn('[SharePoint] Not configured — skipping upload');
      return null;
    }

    await this.ensureFolder(remoteFolder);

    const token = await this.getAccessToken();
    const driveId = await this.getDriveId();
    const fileContent = fs.readFileSync(localFilePath);
    const uploadPath = `${remoteFolder}/${fileName}`;

    // Use upload session for files > 4MB, simple PUT for smaller files
    const fileSizeMB = fileContent.length / (1024 * 1024);
    let result;

    if (fileSizeMB > 4) {
      result = await this._uploadLargeFile(token, driveId, uploadPath, fileContent);
    } else {
      const res = await axios.put(
        `${GRAPH_BASE}/drives/${driveId}/root:/${uploadPath}:/content`,
        fileContent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/octet-stream',
          },
        }
      );
      result = res.data;
    }

    logger.info(`[SharePoint] Uploaded: ${uploadPath} → ${result.webUrl}`);
    return { fileId: result.id, webUrl: result.webUrl };
  }

  /**
   * Upload large file via upload session
   */
  async _uploadLargeFile(token, driveId, uploadPath, fileContent) {
    const sessionRes = await axios.post(
      `${GRAPH_BASE}/drives/${driveId}/root:/${uploadPath}:/createUploadSession`,
      { item: { '@microsoft.graph.conflictBehavior': 'replace' } },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    const uploadUrl = sessionRes.data.uploadUrl;
    const chunkSize = 4 * 1024 * 1024; // 4MB chunks
    let start = 0;

    while (start < fileContent.length) {
      const end = Math.min(start + chunkSize, fileContent.length) - 1;
      const chunk = fileContent.slice(start, end + 1);

      const res = await axios.put(uploadUrl, chunk, {
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileContent.length}`,
          'Content-Type': 'application/octet-stream',
        },
      });

      if (res.status === 201 || res.status === 200) {
        return res.data;
      }

      start = end + 1;
    }

    throw new Error('Upload session did not complete');
  }

  /**
   * Move a file to the archive folder on SharePoint
   * @param {string} fileId       - SharePoint driveItem ID
   * @param {string} formType     - e.g. "jsa", "loto", "oshaAudit"
   * @returns {{ webUrl }}
   */
  async archiveFile(fileId, formType) {
    if (!this.isConfigured() || !fileId) return null;

    const token = await this.getAccessToken();
    const driveId = await this.getDriveId();
    const archiveFolder = `Archived/${this._folderForType(formType)}`;

    await this.ensureFolder(archiveFolder);

    // Get the archive folder item ID
    const folderRes = await axios.get(
      `${GRAPH_BASE}/drives/${driveId}/root:/${archiveFolder}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Move the file by updating its parentReference
    const res = await axios.patch(
      `${GRAPH_BASE}/drives/${driveId}/items/${fileId}`,
      { parentReference: { id: folderRes.data.id } },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );

    logger.info(`[SharePoint] Archived file ${fileId} → ${archiveFolder}`);
    return { webUrl: res.data.webUrl };
  }

  /**
   * Delete a file from SharePoint
   * @param {string} fileId
   */
  async deleteFile(fileId) {
    if (!this.isConfigured() || !fileId) return;

    const token = await this.getAccessToken();
    const driveId = await this.getDriveId();

    await axios.delete(
      `${GRAPH_BASE}/drives/${driveId}/items/${fileId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    logger.info(`[SharePoint] Deleted file ${fileId}`);
  }

  /**
   * Map form type to SharePoint folder name
   */
  _folderForType(formType) {
    const map = {
      jsa: 'JSA',
      loto: 'LOTO',
      injury: 'Injury Reports',
      accident: 'Accident Reports',
      spillReport: 'Spill Reports',
      monthlyInspection: 'Inspections',
      oshaAudit: 'OSHA Audits',
    };
    return map[formType] || formType;
  }

  /**
   * Upload a document after export, and update the DB record
   * @param {object} db          - database instance
   * @param {string} localPath   - path to generated file
   * @param {string} fileName    - file name for SharePoint
   * @param {string} formType    - form type key
   * @param {number} formId      - DB row id
   * @param {string} table       - 'forms' or 'audit_forms'
   */
  async syncAfterExport(db, localPath, fileName, formType, formId, table = 'forms') {
    if (!this.isConfigured()) return;

    try {
      const folder = `Active/${this._folderForType(formType)}`;
      const result = await this.uploadFile(localPath, folder, fileName);

      if (result) {
        await db.runAsync(
          `UPDATE ${table} SET sharepoint_file_id = ?, sharepoint_url = ?,
           sharepoint_synced_at = ?, sharepoint_status = ? WHERE id = ?`,
          [result.fileId, result.webUrl, new Date().toISOString(), 'synced', formId]
        );
      }
    } catch (err) {
      logger.error(`[SharePoint] syncAfterExport failed for ${table}#${formId}:`, err.message);
      await db.runAsync(
        `UPDATE ${table} SET sharepoint_status = ? WHERE id = ?`,
        ['failed', formId]
      ).catch(() => {});
    }
  }
}

module.exports = new SharePointService();
