# Dashboard.jsx Syntax Fix Required

## Issue
Lines 1251-1252 and 1277-1278 in `/Users/jagadish/brightminds_newapp/src/pages/Dashboard.jsx` have incomplete object initialization.

## Fix Needed

### Line 1251-1252
**Current (broken):**
```javascript
setFeedbackData({
}}
```

**Should be:**
```javascript
setFeedbackData({
  type: 'general',
  rating: 0,
  message: '',
  email: '',
  allowContact: false
});
```

### Line 1277-1278
**Current (broken):**
```javascript
setFeedbackData({
} catch (err) {
```

**Should be:**
```javascript
setFeedbackData({
  type: 'general',
  rating: 0,
  message: '',
  email: '',
  allowContact: false
});
} catch (err) {
```

## How to Fix
Manually edit the file and replace the incomplete object literals with the complete initialization shown above.
