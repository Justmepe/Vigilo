# Development Guidelines & Best Practices

This document outlines the standards and best practices for developing new features in the Silver Bay Safety Manager.

## 📋 Pre-Development Checklist

Before starting development, ensure you:
- [ ] Have read the API_DOCUMENTATION.md
- [ ] Understand the project architecture
- [ ] Have set up your local development environment
- [ ] Have access to project management tools
- [ ] Understand the feature requirements

## ✅ Code Quality Standards

### Backend (Node.js/Express)

#### File Structure
```
src/
├── controllers/
│   └── featureController.js     # Handle requests
├── routes/
│   └── feature.routes.js        # Define routes
├── middleware/
│   └── feature.middleware.js    # Feature-specific middleware
├── services/
│   └── featureService.js        # Business logic
└── utils/
    └── featureUtils.js          # Helper functions
```

#### Code Standards
- Use async/await for all asynchronous operations
- Always wrap route handlers with `asyncHandler()`
- Throw custom errors from `utils/errors.js`
- Use parameterized queries to prevent SQL injection
- Add logging at key points using Winston logger
- Include JSDoc comments for all functions

#### Example Controller
```javascript
const logger = require('../utils/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { asyncHandler } = require('../middleware/error.middleware');

exports.getFeature = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate input
  if (!id || isNaN(id)) {
    throw new ValidationError('Invalid ID format');
  }

  // Fetch data
  const feature = await db.getAsync(
    'SELECT * FROM features WHERE id = ?',
    [id]
  );

  // Handle not found
  if (!feature) {
    throw new NotFoundError('Feature');
  }

  // Log success
  logger.info('Feature retrieved', { featureId: id, userId: req.user.id });

  // Return response
  res.json(feature);
});
```

#### Testing Requirements
- Write unit tests for all business logic
- Write integration tests for API endpoints
- Mock external dependencies
- Aim for >80% code coverage
- Test error cases, not just happy paths

```javascript
describe('Feature Controller', () => {
  describe('getFeature', () => {
    it('should return feature when found', async () => {
      // Setup
      // Execute
      // Assert
    });

    it('should throw NotFoundError when feature not found', async () => {
      // Setup
      // Execute
      // Assert error
    });

    it('should validate input', async () => {
      // Test validation
    });
  });
});
```

### Frontend (React)

#### Component Structure
```
components/
├── Feature/
│   ├── Feature.jsx              # Main component
│   ├── Feature.test.jsx         # Component tests
│   ├── Feature.module.css       # Scoped styles
│   ├── FeatureForm.jsx          # Sub-component
│   └── useFeature.js            # Feature-specific hook
```

#### Code Standards
- Use functional components with hooks
- Extract logic into custom hooks
- Use the provided custom hooks from `src/hooks/index.js`
- Handle loading and error states
- Add PropTypes or TypeScript comments
- Include JSDoc comments for components

#### Example Component
```jsx
import { useState, useCallback } from 'react';
import { useApi } from '../../hooks';
import { featureAPI } from '../../services/api';

/**
 * Feature Component
 * @component
 * @param {number} featureId - The feature ID to display
 * @returns {JSX.Element} The feature component
 */
const Feature = ({ featureId }) => {
  const [feature, setFeature] = useState(null);
  const { request, loading, error } = useApi();

  const loadFeature = useCallback(async () => {
    const result = await request('get', `/api/features/${featureId}`);
    if (result.success) {
      setFeature(result.data);
    }
  }, [featureId, request]);

  useEffect(() => {
    loadFeature();
  }, [loadFeature]);

  if (loading) return <div className="spinner">Loading...</div>;
  if (error) return <div className="error">{error.message}</div>;
  if (!feature) return <div>No feature found</div>;

  return (
    <div className="feature">
      <h2>{feature.name}</h2>
      <p>{feature.description}</p>
    </div>
  );
};

export default Feature;
```

#### Testing Requirements
- Test component rendering
- Test user interactions
- Test loading/error states
- Mock API calls
- Test conditional rendering

```jsx
describe('Feature Component', () => {
  it('should render feature when loaded', () => {
    // Setup mocks
    // Render component
    // Assert rendering
  });

  it('should show loading state initially', () => {
    // Assert loading indicator
  });

  it('should show error message on failure', () => {
    // Mock error
    // Assert error display
  });
});
```

## 🔐 Security Standards

### Input Validation
- ✅ Validate all user input
- ✅ Use `express-validator` on backend
- ✅ Sanitize data before processing
- ✅ Check field types and lengths

### Authentication & Authorization
- ✅ Verify JWT tokens on protected routes
- ✅ Check user roles for authorization
- ✅ Verify resource ownership
- ✅ Log all auth attempts

### Data Protection
- ✅ Hash passwords with bcrypt
- ✅ Never log sensitive data
- ✅ Use HTTPS in production
- ✅ Validate file uploads
- ✅ Use parameterized queries

## 📚 Documentation Standards

### Code Comments
- Add JSDoc comments to all functions
- Explain complex logic with inline comments
- Keep comments up-to-date with code

```javascript
/**
 * Validates user input and creates a new feature
 * @param {Object} featureData - The feature data
 * @param {string} featureData.name - Feature name (required)
 * @param {string} featureData.description - Feature description
 * @returns {Promise<Object>} The created feature
 * @throws {ValidationError} If input is invalid
 */
```

### API Documentation
- Add endpoint to API_DOCUMENTATION.md
- Include request/response examples
- Document error cases
- List required parameters

### Commit Messages
- Use clear, descriptive messages
- Follow convention: `type: description`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Example: `feat: add feature list endpoint with pagination`

## 🧪 Testing Checklist

Before submitting code:
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] >80% code coverage (/coverage report)
- [ ] Error cases tested
- [ ] Input validation tested
- [ ] No console.errors or warnings

## 📋 Feature Development Checklist

### 1. Planning
- [ ] Requirements are clear
- [ ] Design approved
- [ ] API spec defined
- [ ] Database schema updated (if needed)

### 2. Backend Development
- [ ] Create database schema
- [ ] Create controller with error handling
- [ ] Create service with business logic
- [ ] Add validation middleware
- [ ] Add routes with auth checks
- [ ] Write integration tests
- [ ] Update API documentation
- [ ] Test error cases
- [ ] Add logging

### 3. Frontend Development
- [ ] Create API service methods
- [ ] Create main component
- [ ] Handle loading/error states
- [ ] Add form validation
- [ ] Create custom hooks if needed
- [ ] Write component tests
- [ ] Add proper TypeScript/PropTypes
- [ ] Test with actual API

### 4. Integration
- [ ] Test full flow with backend
- [ ] Test error handling
- [ ] Test with different user roles
- [ ] Test offline functionality (if applicable)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness check

### 5. Code Review
- [ ] Code follows standards
- [ ] No security issues
- [ ] Proper error handling
- [ ] Tests are comprehensive
- [ ] Documentation is complete
- [ ] No console logs in production code

### 6. Deployment
- [ ] Run production build
- [ ] Test in staging environment
- [ ] Database migrations applied
- [ ] Env variables configured
- [ ] Health checks passing
- [ ] Monitoring/logging working

## 🐛 Debugging Tips

### Backend Debugging
```bash
# Enable detailed logging
LOG_LEVEL=debug npm run dev

# Use Node debugger
node --inspect server.js
# Then open chrome://inspect

# Check database directly
sqlite3 database/safety_manager.db
```

### Frontend Debugging
```javascript
// Use React DevTools extension
console.log('Debug:', variableName);

// Use debugger statement
debugger; // Pauses in browser dev tools

// Use Network tab to inspect API calls
// Use React Profiler for performance
```

## 📊 Code Style

### Naming Conventions
- **Files**: camelCase for JS, PascalCase for components
- **Variables**: camelCase
- **Classes**: PascalCase (not used much)
- **Constants**: UPPER_SNAKE_CASE
- **Database fields**: snake_case
- **URLs**: kebab-case

### Example
```javascript
// Constants
const MAX_FILE_SIZE = 5242880;

// Variables
const userName = 'John';
const isAdmin = true;

// Functions
function calculateTotal() { }
const getUser = () => { };

// Components
const UserProfile = () => { };

// Database fields
SELECT user_name, created_at FROM users;
```

## 🚀 Performance Guidelines

### Backend
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Cache static data appropriately
- Use connection pooling
- Monitor query performance

### Frontend
- Use React.memo for expensive components
- Implement code splitting
- Lazy load images
- Minimize bundle size
- Use proper key props in lists

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
git add .
git commit -m "feat: add feature"

# Push and create PR
git push origin feature/feature-name

# After review and approval
git merge feature/feature-name

# Clean up
git branch -d feature/feature-name
```

## 📞 Getting Help

- **Documentation**: Check API_DOCUMENTATION.md
- **Architecture**: Review PROFESSIONAL_IMPROVEMENTS.md
- **Errors**: Check error logs in `backend/logs/`
- **Team**: Reach out to team lead or IT department

## 📝 Useful Commands

```bash
# Backend
npm run dev              # Start with auto-reload
npm test                 # Run tests
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix issues
npm run init-db          # Initialize database

# Frontend
npm start                # Start dev server
npm test                 # Run tests
npm run build            # Production build

# Database
sqlite3 database/safety_manager.db
SELECT * FROM users;
```

---

**Remember:** Write code that you would want to maintain 6 months from now!

**Last Updated:** February 11, 2026  
**Version:** 1.0.0
