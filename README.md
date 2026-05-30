<div align="center">

# SyncSpace

### AI-Powered Collaborative Whiteboard 

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=flat-square)](https://groq.com)

[Features](#-features) • [Architecture](#-project-architecture) • [Getting Started](#-getting-started)

</div>

---

##  Overview

SyncSpace is a full-stack real-time collaborative whiteboard application. Multiple users can draw simultaneously on shared canvases, and an integrated AI assistant can help generate system architecture diagrams, flowcharts, and component diagrams directly on the canvas from a simple text prompt.

---

## Features

###  Real-time Collaboration
- Multiple users can draw on the same canvas simultaneously
- Changes sync instantly via Socket.io
- Join any canvas by shared URL
- Authorization-only permitted users can edit

### Generative AI Diagram Builder
- Transform natural language prompts into fully structured, color-coded system architecture diagrams in seconds (e.g. “Design a scalable URL shortener architecture”)
- Real-time synchronization ensures every generated update appears instantly for all collaborators
- by **Groq API** (LLaMA 3.3 70B)

### Canvas Management
- Create, rename, and save multiple canvases
- Auto-save on every drawing action
- Load previous canvases from the dashboard
- Download canvas as PNG

---

## Project Folder Structure

```
collabboard/
├── frontend/  
│   └── src/
│       ├── components/
│       │   ├── Board/                 # Main canvas component
│       │   │   ├── index.jsx          # Canvas rendering, mouse handlers, AI integration
│       │   │   └── index.module.css
│       │   ├── Toolbar/               # Top toolbar with drawing tools
│       │   │   ├── index.jsx
│       │   │   └── index.module.css
│       │   ├── Toolbox/               # Color & size pickers sidebar
│       │   │   ├── index.jsx
│       │   │   └── index.module.css
│       │   ├── Sidebar/               # Navigation sidebar
│       │   ├── AIPromptPanel/         # AI diagram generator UI
│       │   │   ├── index.jsx
│       │   │   └── index.module.css
│       │   ├── Dashboard/             # Canvas list & management
│       │   ├── LandingPage/           # Marketing landing page
│       │   ├── About/                 # About page
│       │   ├── Help/                  # Help & FAQ page
│       │   ├── Login/                 # Auth pages
│       │   └── Register/
│       ├── store/
│       │   ├── board-context.js       # Context shape & defaults
│       │   ├── BoardProvider.jsx      # Canvas state (useReducer) + AI panel state
│       │   └── toolbox-context.js     # Stroke/fill/size state
│       ├── utils/
│       │   ├── element.js             # Element creation & hit-testing
│       │   ├── socket.js              # Socket.io client helpers
│       │   └── api.js                 # Axios API helpers
│       ├── constants.js               # TOOL_ITEMS, BOARD_ACTIONS, TOOL_ACTION_TYPES
│       └── App.jsx                    # Routes
│
└── backend/                         
    ├── server.js                   
    ├── config/
    │   └── db.js                        # DB connection
    ├── controllers/
    │   ├── canvasController.js          # Canvas CRUD logic
    │   └── userController.js            # Register, login logic
    ├── middlewares/
    │   └── authMiddleware.js            # JWT verification
    ├── models/
    │   ├── canvasModel.js               # Canvas Mongoose schema
    │   └── userModel.js                 # User Mongoose schema
    ├── routes/
    │   ├── aiRoutes.js                  # POST: /api/ai/generate
    │   ├── canvasRoutes.js              # Canvas REST endpoints
    │   └── userRoutes.js                # Auth endpoints
    ├── services/
    │   └── userService.js        
    ├── sockets/
    │   └── socketHandler.js             # joinCanvas,drawingUpdate
    └── utils/
        └── jwt.js                       # Token sign & verify 
```

## Architecture

```mermaid
flowchart TD
    User([" User"])

    subgraph UI["Browser — UI Layer"]
        direction LR
        CV["Canvas\nrough.js · freehand"]
        TB["Toolbar\n7 Drawing Tools"]
        AP["AI Panel\nPrompt Input"]
    end

    subgraph STATE["Frontend"]
        direction LR
        BC["BoardContext\nuseReducer · undo · redo"]
        TC["ToolboxContext\ncolor · size · stroke"]
        AX["Axios\nREST calls"]
        SK["Socket.io Client\nreal-time sync"]
    end

    subgraph SERVER["Backend"]
        direction LR
        EX["Express\nREST API"]
        SO["Socket Server\njoinCanvas · broadcast"]
        MW["Auth Middleware\nJWT verify"]
    end

    subgraph ROUTES[" API Routes"]
        direction LR
        UR["POST /api/users\nregister · login"]
        CR["GET·PUT /api/canvas\nload · save · rename"]
        AR["POST /api/ai/generate\nAI Diagrams"]
    end

    subgraph PERSIST["Data"]
        DB[("MongoDB Atlas\nusers · canvases")]
    end

    subgraph AIBLOCK["AI"]
        GR["Groq API\nLLaMA 3.3 70B"]
    end

    %% User → UI
    User -->|draws / clicks| CV
    User -->|selects tool| TB
    TB -->|opens| AP

    %% UI → State
    CV <-->|"reads · updates"| BC
    TB <-->|"reads · updates"| TC

    %% State → Transport
    BC --> AX
    BC --> SK

    %% Transport → Backend
    AX -->|"HTTP"| EX
    SK <-->|"WebSocket"| SO

    %% Backend → Routes
    EX --> MW
    MW --> UR
    MW --> CR
    MW --> AR

    %% Routes → Data
    UR -->|"read · write"| DB
    CR -->|"read · write"| DB

    %% Socket broadcast
    SO -->|"drawingUpdate"| SK

    %% AI Flow
    AR -->|"Groq SDK"| GR
    GR -->|"JSON shapes"| AR
    AR -->|"shapes response"| AP
    AP -->|"setElements()"| CV

    %% Styles
    classDef ui       fill:#ede9fe,stroke:#7c3aed,color:#3b0764,rx:8
    classDef state    fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,rx:8
    classDef server   fill:#dcfce7,stroke:#16a34a,color:#14532d,rx:8
    classDef routes   fill:#d1fae5,stroke:#059669,color:#064e3b,rx:8
    classDef data     fill:#fef9c3,stroke:#ca8a04,color:#713f12,rx:8
    classDef ai       fill:#fce7f3,stroke:#db2777,color:#831843,rx:8
    classDef user     fill:#f1f5f9,stroke:#475569,color:#0f172a,rx:99

    class CV,TB,AP ui
    class BC,TC,AX,SK state
    class EX,SO,MW server
    class UR,CR,AR routes
    class DB data
    class GR ai
    class User user
```
 
##  AI Work Flow
 
```mermaid
sequenceDiagram
    actor User
    participant Panel as AI Panel
    participant API as Express /api/ai/generate
    participant Groq as Groq API (LLaMA 3.3 70B)
    participant Canvas as Canvas (Board.jsx)
    participant Socket as Socket.io
 
    User->>Panel: Types prompt
    Note over Panel: "Create chat app architecture"
    Panel->>API: POST { prompt }
    API->>Groq: System prompt + user prompt
    Groq-->>API: JSON array of shapes
    Note over API: [{type,x,y,width,height,<br/>text,color,strokeColor}]
    API-->>Panel: { shapes: [...] }
    Panel->>Canvas: handleShapesGenerated(shapes)
    Note over Canvas: Convert to roughEle objects
    Canvas->>Canvas: setElements([...prev, ...newElements])
    Canvas->>Socket: emitSocketEvent(drawingUpdate)
    Socket-->>Canvas: Broadcast to all collaborators
```
 
---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- [Groq API key](https://console.groq.com/keys) 

### 1. Clone the repo

```bash
git clone https://github.com/priyanshu026922/SyncSpace.git
cd SyncSpace
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
MONGODB_URI=__your_mongodb_database_url_here__
JWT_SECRET=jwt_secret_here
GROQ_API_KEY=_gsk_groq_api_key_
```

Start the server:

```bash
node server.js
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

### 4. Open the app

```
http://localhost:3000
```

---


### AI Integration
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ai/generate` | `{ "prompt": "..." }` | Generate diagram JSON from prompt |

**Example request:**
```bash  
  (IN POSTMAN)
  POST  http://localhost:5000/api/ai/generate
    Body → raw → JSON

    {
    "prompt": "System design for URL shortener"
    }
```

**Example response:**
```json
{
  "shapes": [
    { "type": "rectangle", "x": 60, "y": 100, "width": 180, "height": 60, "text": "Client", "color": "#dbeafe", "strokeColor": "#2563eb" },
    { "type": "rectangle", "x": 320, "y": 100, "width": 180, "height": 60, "text": "API Gateway", "color": "#ffedd5", "strokeColor": "#ea580c" },
    { "type": "arrow", "x1": 240, "y1": 130, "x2": 320, "y2": 130, "strokeColor": "#94a3b8" }
  ]
}
```
---


## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React.js, Rough.js,Socket.io Client,Axios,React Router|
| Backend | Node.js, Express, Socket.io, MongoDB, Mongoose, JWT ,dotenv|
| AI | Groq SDK · LLaMA 3.3 70B |
