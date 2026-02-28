import React from 'react';
import RelationshipGraphApp from './RelationshipGraphApp';
import AdminRoute from './components/AdminRoute';

function App() {
  // Simple routing based on URL path
  const currentPath = window.location.pathname;

  if (currentPath === '/admin') {
    return <AdminRoute />;
  }

  return <RelationshipGraphApp />;
}

export default App;
