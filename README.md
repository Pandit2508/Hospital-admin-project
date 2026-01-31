Hospital Resource Coordination System with Application-Level Replication
Overview
This project is a real-time multi-hospital resource coordination platform designed to manage emergency requests, hospital resources, and inter-hospital communication efficiently.
The system focuses on:
•	Real-time updates
•	High availability
•	Application-level replication
•	Eventual consistency
•	Scalable modular architecture
It was developed as a college project to demonstrate concepts of distributed systems, replication strategies, and database consistency trade-offs.
________________________________________
Objectives
•	Enable hospitals to share resource availability in real time
•	Reduce manual communication delays
•	Provide high availability through replication
•	Demonstrate application-level asynchronous replication
•	Study eventual consistency in distributed systems
________________________________________
 Key Features
Real-time  Coordination
•	Hospitals can post  resource requests
•	Other hospitals can respond instantly
•	Sub-second updates using real-time database listeners
 Application-Level Replication
•	Primary database acts as source of truth
•	Secondary database mirrors updates asynchronously
•	Read fallback supported in case of primary failure
Modular System Design
•	Monitoring Module
•	Resource Allocation Module
•	Replication Engine
•	Conflict Handling Layer
Eventual Consistency
•	Temporary divergence allowed
•	Automatic synchronization ensures convergence
________________________________________
System Architecture
High-Level Flow
Client → Backend → Primary Database
                     ↓
                Async Replication
                     ↓
               Secondary Database
Modules
1.	Monitoring System
o	Tracks hospital resource availability
o	Updates in real-time
2.	Allocation Engine
o	Matches requests with available hospitals
o	Prioritizes emergency cases
3.	Replication Module
o	Detects database changes
o	Mirrors data to backup database
o	Ensures eventual consistency
________________________________________
 Tech Stack
Frontend
•	React.js
•	Tailwind CSS
•	Real-time listeners
Backend
•	Node.js
•	Express.js
Database
•	Firebase Firestore (Primary)
•	Firebase Firestore (Replica)
________________________________________
Replication Strategy
Type
Application-Level Asynchronous Replication
How It Works
1.	Write operations go to Primary DB
2.	Replication module captures updates
3.	Changes asynchronously pushed to Replica DB
4.	Replica catches up if temporarily disconnected
________________________________________
 Consistency Model
Eventual Consistency
•	Temporary inconsistencies allowed
•	All replicas converge over time
•	Designed for availability over strict consistency
________________________________________
Testing
Tested scenarios:
•	Replica lag
•	Network failure
•	Listener synchronization
•	Conflict detection
•	Failover handling
________________________________________
 Limitations
•	No multi-master replication
•	No automatic conflict resolution
•	Replica writes restricted
•	Not suitable for financial-critical systems
________________________________________
Future Improvements
•	Conflict resolution strategies
•	Automated failover
•	Multi-region replication
•	Monitoring dashboard
•	Logging system
________________________________________
Learning Outcomes
•	Distributed database replication
•	Eventual consistency models
•	CAP theorem trade-offs
•	Real-time data synchronization
