describe('Seafood Safety App - Full E2E Test', () => {
  before(() => {
    // Visit the application
    cy.visit('http://localhost:3000');
  });

  it('should load the login page', () => {
    cy.get('h1').should('contain', 'Login');
    cy.screenshot('01-login-page');
  });

  it('should login with valid credentials', () => {
    cy.get('input[type="text"]').first().type('admin');
    cy.get('input[type="password"]').type('Admin123!');
    cy.get('button').contains(/login|sign in/i).click();
    cy.wait(2000);
    cy.screenshot('02-dashboard-loaded');
  });

  it('should display dashboard with all sections', () => {
    // Check for main dashboard elements
    cy.get('h1').should('exist');
    cy.screenshot('03-dashboard-overview');
  });

  it('should display sidebar navigation', () => {
    cy.get('.sidebar').should('be.visible');
    cy.screenshot('04-sidebar-navigation');
  });

  it('should navigate to new assessment form', () => {
    cy.contains('New Assessment').click();
    cy.wait(1000);
    cy.screenshot('05-new-assessment-page');
  });

  it('should display form selection grid', () => {
    cy.get('.form-selection-grid', { timeout: 3000 }).should('be.visible');
    cy.screenshot('06-form-selection-grid');
  });

  it('should open JSA form', () => {
    cy.contains('Job Safety Analysis').click();
    cy.wait(2000);
    cy.screenshot('07-jsa-form-opened');
  });

  it('should display form fields and photo section', () => {
    // Scroll to see the photo section
    cy.get('.camera-field').should('be.visible');
    cy.screenshot('08-photo-section-desktop');
  });

  it('should test camera button responsiveness', () => {
    cy.get('.camera-button').should('be.visible');
    cy.get('.camera-button').should('have.text.match', /camera|upload|photo/i);
    cy.screenshot('09-camera-button-focus');
  });

  it('should handle viewport changes - tablet (768px)', () => {
    cy.viewport(768, 1024);
    cy.screenshot('10-tablet-view-768px');
  });

  it('should handle mobile viewport (480px)', () => {
    cy.viewport(480, 800);
    cy.screenshot('11-mobile-view-480px');
  });

  it('should handle small mobile (375px)', () => {
    cy.viewport(375, 667);
    cy.screenshot('12-iphone-view-375px');
  });

  it('should test responsive photo section on mobile', () => {
    cy.viewport(375, 667);
    cy.get('.camera-field').should('be.visible');
    cy.get('.camera-button').should('be.visible');
    cy.screenshot('13-mobile-photo-section');
  });

  it('should test landscape orientation (mobile)', () => {
    cy.viewport(667, 375);
    cy.screenshot('14-mobile-landscape');
  });

  it('should return to desktop view', () => {
    cy.viewport(1200, 800);
    cy.screenshot('15-desktop-1200px');
  });

  it('should navigate to Dashboard page', () => {
    cy.contains('Dashboard').click();
    cy.wait(1000);
    cy.screenshot('16-main-dashboard');
  });

  it('should display stats cards', () => {
    cy.get('.stats-grid').should('be.visible');
    cy.screenshot('17-stats-cards');
  });

  it('should navigate to Action Items', () => {
    cy.contains('Action Items').click();
    cy.wait(1000);
    cy.screenshot('18-action-items-page');
  });

  it('should navigate to Training section', () => {
    cy.contains('Training').click();
    cy.wait(1000);
    cy.screenshot('19-training-section');
  });

  it('should navigate to SDS Library', () => {
    cy.contains('SDS Library').click();
    cy.wait(1000);
    cy.screenshot('20-sds-library');
  });

  it('should navigate to Settings', () => {
    cy.contains('Settings').click();
    cy.wait(1000);
    cy.screenshot('21-settings-page');
  });

  it('should test responsive sidebar on mobile', () => {
    cy.viewport(480, 800);
    cy.get('.sidebar').should('be.visible');
    cy.screenshot('22-mobile-sidebar');
  });

  it('should test form scrolling and content accessibility', () => {
    cy.viewport(375, 667);
    cy.contains('New Assessment').click();
    cy.wait(1000);
    cy.get('body').scrollTo('bottom');
    cy.screenshot('23-mobile-form-bottom');
  });

  it('should test wide desktop resolution', () => {
    cy.viewport(1920, 1080);
    cy.screenshot('24-wide-desktop-1920px');
  });

  it('should test ultra-wide resolution', () => {
    cy.viewport(2560, 1440);
    cy.screenshot('25-ultra-wide-2560px');
  });

  it('should verify responsive button sizes on mobile', () => {
    cy.viewport(480, 800);
    cy.get('button').first().then($button => {
      expect($button.outerHeight()).to.be.greaterThan(44);
    });
    cy.screenshot('26-mobile-button-sizes');
  });

  it('should verify form inputs are readable on mobile', () => {
    cy.viewport(375, 667);
    cy.contains('New Assessment').click();
    cy.wait(1000);
    cy.get('input[type="text"]').first().should('be.visible');
    cy.get('input[type="text"]').first().should('have.css', 'font-size');
    cy.screenshot('27-mobile-form-inputs');
  });

  it('should test photo section layout on all viewport sizes', () => {
    // Small mobile
    cy.viewport(320, 568);
    cy.contains('New Assessment').click();
    cy.wait(1000);
    cy.get('.camera-field', { timeout: 5000 }).should('be.visible');
    cy.screenshot('28-iphone-se-320px-photo');
    
    // Tablet
    cy.viewport(768, 1024);
    cy.screenshot('29-tablet-photo-section');
    
    // Desktop
    cy.viewport(1200, 800);
    cy.screenshot('30-desktop-photo-section');
  });

  it('should complete test summary', () => {
    cy.viewport(1200, 800);
    cy.screenshot('31-test-complete');
  });
});
