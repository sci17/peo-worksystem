# peo-worksystem


📌 Overview

The Provincial Engineering Office (PEO) Workflow Management System is a web-based platform designed to automate and streamline the internal processes of the engineering office. It manages project requests, approvals, task assignments, document handling, and progress monitoring in a centralized system.

This system enhances operational efficiency, improves transparency, and reduces manual paperwork by digitizing the entire workflow—from request submission to project completion.

🎯 Key Features

📥 Request Management
Submit engineering service requests (repairs, inspections, infrastructure projects)
Attach supporting documents and images
Automatic request logging and tracking

🔄 Workflow Automation
Multi-level approval process (Admin, Engineer, Supervisor)
Status tracking (Pending → Approved → Ongoing → Completed)
Real-time updates and notifications

🧑‍💼 User Roles & Access Control
Role-based access (Admin, Staff, Engineer, Viewer)
Secure authentication and authorization
Activity logging per user

📊 Dashboard & Monitoring
Real-time project status overview
Visual statistics (completed, pending, delayed projects)
Performance tracking for departments

🔔 Notification System
Alerts for new requests, approvals, and updates
Notification bell with activity logs
Email or in-system notifications (optional)

📁 Document & File Management
Upload and store project files, images, and reports
Organized file system per project
Secure access and retrieval
⚡ Caching System
Stores frequently accessed data for faster performance
Reduces database load
Improves response time for large datasets


🌐 LAN Deployment Ready
Accessible within local network (office setup)
Optional .local domain (e.g., peo-portal.local)
Can run offline without internet dependency
🛠️ Tech Stack

💻 Backend
Django (Python) – Web framework for rapid development
Django REST Framework (optional) – API support
Gunicorn – WSGI HTTP server

🎨 Frontend
HTML5, CSS3, JavaScript
Bootstrap – Responsive UI design
Materio Dashboard Template – Admin interface

🗄️ Database
MySQL or SQLite (development)
ORM handled by Django


⚙️ DevOps / Deployment
Docker – Containerized deployment
Nginx – Reverse proxy and static file server
SSL (HTTPS) – Secure local or production access


🧠 Performance & Storage
Django Cache Framework (Redis or Local Memory)
Media storage for uploaded files


🚀 Benefits
📈 Faster processing of engineering requests
📂 Organized and centralized data management
🔍 Improved transparency and accountability
⚡ Reduced manual workload and paperwork
🏢 Suitable for government office environment



🔒 Security Features
User authentication and role-based permissions
Secure file handling and storage
HTTPS support for encrypted communication
Activity logs and audit trails


📌 Future Enhancements
SMS/Email notification integration
GIS integration for project mapping
Mobile-friendly or dedicated mobile app
Advanced analytics and reporting
Cloud deployment option
📄 License

This project is intended for educational and government workflow automation purposes.

👨‍💻 Author

Developed as part of a system designed to modernize and digitize Provincial Engineering Office operations.
