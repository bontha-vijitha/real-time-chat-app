# 🚀 Real-Time Chat Application

A high-performance, professional-grade real-time chat application built for the **Adverayze Technical Assignment**.

---

## 🌟 Key Features

### 📡 **Real-Time Synchronization**
- Instant message delivery using **Socket.io**.
- Real-time **Global Deletion** (Delete for Everyone).
- Synchronized **Pinning/Unpinning** states across all connected users.

### 📌 **Message Pinning (Professional UX)**
- **Multiple Pinned Messages**: Support for pinning multiple messages simultaneously.
- **Dedicated Top Banner**: View all pinned messages in a clean, scrollable horizontal list.
- **Visual Highlighting**: Pinned messages in the chat list feature a golden border and a subtile amber glow.

### 🗑️ **Flexible Deletion**
- **Delete for Me**: Removes the message locally for the user (persistent after refresh).
- **Delete for Everyone**: Globally replaces the message with a "This message was deleted" placeholder for all participants.

### 🎨 **Premium UI/UX (Glassmorphism)**
- **Modern Dark Theme**: Deep navy-to-black gradients with translucent background blurs.
- **Micro-Animations**: Smooth fade-in-up effects for messages and character counter shake animations on error.
- **Responsive Layout**: Designed to work perfectly on both high-resolution desktops and mobile screens.
- **Auto-Scroll & Empty States**: Automatically scrolls to the bottom on new messages and shows a friendly placeholder when the chat is empty.

### 🛡️ **Robust Validation**
- **Strict Character Limits**: Real-time validation preventing messages over 500 characters.
- **Dynamic Feedback**: Input characters are tracked with a live counter (`123/500`) that warns you visually if you exceed the limit.
- **Safe Send Logic**: Send buttons are automatically disabled for empty or invalid messages.

---

## 🛠️ Technical Stack

- **Frontend**: Next.js 14+ (App Router), React, Socket.io-client.
- **Styling**: Premium Vanilla CSS (custom design system, no bulky frameworks).
- **Icons**: Lucide-React.
- **Backend**: Node.js, Express, Socket.io.
- **Database**: **SQLite** (via `better-sqlite3`) — Provides 100% persistence with zero configuration needed for the evaluator.

---

## 🚀 Getting Started

### **1. Clone the repository**
```bash
git clone <your-repo-link>
cd chat-app
```

### **2. Install Dependencies**
```bash
# In the client folder
cd client
npm install

# In the server folder
cd ../server
npm install
```

### **3. Run the Project**
**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 📝 Design Decisions

**Why SQLite?**
I chose SQLite for this assignment because it provides full data persistence (your messages stay after restart) while being **file-based**. This means the evaluator can run the app immediately without setting up MongoDB Atlas or local database services.

**Vanilla CSS over Tailwind?**
To achieve an extremely specific "Glassmorphism" look with custom backdrop-filters and smooth multi-stop gradients, I opted for pure CSS to ensure zero overhead and maximum design control.

---

## 📜 Assignment Criteria Fulfilled
- [x] **4.1 Messaging System**: Send/View messages with timestamps.
- [x] **4.2 Delete Functionality**: Delete for Me and Delete for Everyone.
- [x] **4.3 Pin Messages**: Highly visible pinning system with multiple support.
- [x] **4.4 Real-Time Updates**: Fully functional Socket.io integration.
- [x] **Bonus**: Character counter, Input validation, and Premium Dark UI.

---

### **Prepared by: [Your Name]**
*Developed as part of the Adverayze Full-Stack Developer Hiring Process.*
