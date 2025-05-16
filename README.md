# Atomic SDK

[![Node.js](https://img.shields.io/badge/Node.js->=18-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

A lightweight, event-based SDK for building flow-controllable components in Node.js applications, particularly designed for Node-RED environments. Atomic SDK provides essential building blocks for creating pausable/resumable data processing flows with efficient session management.

## Overview

Atomic SDK enables developers to build components that can pause and resume processing, which is particularly useful when working with large datasets or long-running operations. The SDK provides a foundation for implementing flow control in Node.js applications, with special focus on Node-RED integration.

## Features

- **Event-Based Architecture**: Built on Node.js EventEmitter for familiar, robust event handling
- **Session Management**: Create, track and manage independent processing sessions
- **Flow Control Support**: Built-in support for pause/resume operations in data streams
- **Modular Design**: Extensible module system for adding capabilities to components
- **Lightweight**: Minimal dependencies and footprint

## Installation

```bash
npm install @brobridge/atomic-sdk
```

## Basic Usage

```javascript
const { registerAtomicComponent, enableSessionManager } = require('@brobridge/atomic-sdk');

// Register a node as an Atomic component
registerAtomicComponent(node);

// Enable session management capabilities
enableSessionManager(node);

// Access the session manager
const sessionManager = node.atomic.getModule('SessionManager');

// Create a new session
const session = sessionManager.createSession();

// Listen for session events
session.on('resume', () => {
  // Process the next chunk of data
  console.log('Processing resumed');
});

session.on('close', () => {
  // Cleanup when session is closed
  console.log('Session closed');
});

// Resume the session to begin/continue processing
session.resume();

// Close the session when done
session.close();
```

## Session Management

The SDK provides robust session management capabilities through the SessionManager module:

```javascript
// Create a new session
const session = sessionManager.createSession();

// Get a session by ID
const existingSession = sessionManager.getSession(sessionId);

// Close a session
sessionManager.closeSession(sessionId);

// Resume a paused session
sessionManager.resumeSession(sessionId);
```

### Working with Sessions

Sessions provide methods to manage the processing state and attach session information to messages:

```javascript
// Attach session ID to a message
const msg = { payload: 'data' };
session.bindMessage(msg);
// msg now contains: { payload: 'data', sessions: ['session-id'] }

// Remove session ID from a message
session.unbindMessage(msg);

// Count how many times a session has been resumed
console.log(session.resumeCounter);

// Check if a session is closed
console.log(session.isClosed);
```

## Creating Flow-Controllable Components

A flow-controllable component can pause and resume its processing based on external signals:

```javascript
function createFlowControllableNode(RED) {
  function CustomNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    
    // Register as Atomic component with session management
    registerAtomicComponent(node);
    enableSessionManager(node);
    
    const sm = node.atomic.getModule('SessionManager');
    
    this.on('input', function(msg, send, done) {
      // Create a new processing session
      const session = sm.createSession();
      
      // Handle resume events
      session.on('resume', function() {
        // Do some processing
        const result = { payload: processNextChunk() };
        
        // Attach session info to outgoing message
        session.bindMessage(result);
        send(result);
        
        // Close session if complete
        if (isProcessingComplete()) {
          session.close();
        }
      });
      
      // Clean up when session is closed
      session.on('close', function() {
        done();
      });
      
      // Start processing
      session.resume();
    });
  }
  
  RED.nodes.registerType('custom-node', CustomNode);
}
```

## Module System

The Atomic SDK allows registering and retrieving custom modules:

```javascript
// Check if a module/capability is supported
if (node.atomic.hasSupport('customFeature')) {
  // Use the feature
}

// Add support for a capability
node.atomic.addSupport('customFeature');

// Register a custom module
node.atomic.registerModule('CustomModule', new CustomModule());

// Get a registered module
const customModule = node.atomic.getModule('CustomModule');
```

## Integration with Flow Control

The Atomic SDK works seamlessly with the [@brobridge/atomic-flowcontrol](https://github.com/BrobridgeOrg/atomic-flowcontrol) package to enable advanced flow control in Node-RED:

```javascript
// In a flow-controllable node
node.on('input', function(msg, send, done) {
  const session = sm.createSession();
  
  // Process will pause here until resumed by a Flow Control node
  session.on('resume', function() {
    // Process the next chunk
    send({ payload: 'Processing chunk ' + session.resumeCounter });
    
    if (processingComplete) {
      session.close();
    }
  });
  
  // Initial processing
  session.resume();
});
```

## Example: Creating a Pausable Data Source

```javascript
const { registerAtomicComponent, enableSessionManager } = require('@brobridge/atomic-sdk');

module.exports = function(RED) {
  function DataSourceNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    
    // The total number of messages to send
    const totalMessages = config.messages || 10;
    
    // Initialize Atomic capabilities
    registerAtomicComponent(node);
    enableSessionManager(node);
    
    const sm = node.atomic.getModule('SessionManager');
    
    this.on('input', function(msg, send, done) {
      // Create a new session for this processing
      const session = sm.createSession();
      
      // Handle resume events (including the first one)
      session.on('resume', function() {
        // Create a message with the current count
        const message = {
          payload: `Message ${session.resumeCounter}`,
          complete: (session.resumeCounter >= totalMessages)
        };
        
        // Attach session ID to the message
        session.bindMessage(message);
        send(message);
        
        // Close the session if we've sent all messages
        if (session.resumeCounter >= totalMessages) {
          session.close();
        }
      });
      
      // Clean up when the session is closed
      session.on('close', function() {
        done();
      });
      
      // Start processing by triggering the first resume
      session.resume();
    });
  }
  
  RED.nodes.registerType('data-source', DataSourceNode);
}
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Author

Fred Chien <fred@brobridge.com>

## Support

For issues and feature requests, please [file an issue](https://github.com/BrobridgeOrg/atomic-sdk/issues) on GitHub.
