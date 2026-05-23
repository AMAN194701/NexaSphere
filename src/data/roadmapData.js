export const roadmapData = {
  webdev: {
    title: "Web Development",
    description: "Master modern front-end and back-end web technologies to build scalable web applications.",
    nodes: [
      {
        id: "html-css",
        label: "HTML & CSS",
        description: "The structural and styling backbone of the web. Learn layout techniques, responsiveness, and semantic structures.",
        concepts: ["Semantic HTML", "CSS Grid & Flexbox", "Responsive Design (Media Queries)", "CSS Custom Properties"],
        docs: "https://developer.mozilla.org/en-US/docs/Web/HTML",
        tutorials: [
          { title: "HTML/CSS Full Course - FreeCodeCamp", url: "https://www.youtube.com/watch?v=kUMe1FH4CHE" },
          { title: "CSS Flexbox Guide - CSS-Tricks", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }
        ],
        practice: [
          { title: "Frontend Mentor Challenges", url: "https://www.frontendmentor.io" },
          { title: "Flexbox Froggy Game", url: "https://flexboxfroggy.com" }
        ]
      },
      {
        id: "javascript",
        label: "JavaScript (ES6+)",
        description: "Add interactivity, handle API requests, and learn modern programming principles using JavaScript.",
        concepts: ["DOM Manipulation", "Promises & Async/Await", "ES6+ Features", "Array Methods & Scope"],
        docs: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        tutorials: [
          { title: "JavaScript for Beginners - JavaScript.info", url: "https://javascript.info" },
          { title: "Modern JS Tutorial - Net Ninja", url: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9ivBXXbgIcFl2C6FUzHFFt5" }
        ],
        practice: [
          { title: "JavaScript Exercises - Exercism", url: "https://exercism.org/tracks/javascript" },
          { title: "JS practice challenges - Codewars", url: "https://www.codewars.com" }
        ]
      },
      {
        id: "git-versioning",
        label: "Git & Version Control",
        description: "Track code changes, collaborate seamlessly with teams, and master code repository management.",
        concepts: ["Git Branching & Merging", "Rebasing vs Merging", "Remote Repositories", "Conflict Resolution"],
        docs: "https://git-scm.com/doc",
        tutorials: [
          { title: "Git & GitHub Crash Course - Traversy Media", url: "https://www.youtube.com/watch?v=RGOj5yH7evk" }
        ],
        practice: [
          { title: "Learn Git Branching Interactive Game", url: "https://learngitbranching.js.org" }
        ]
      },
      {
        id: "react",
        label: "React.js Framework",
        description: "Build reactive, modular frontend applications utilizing a component-based paradigm and virtual DOM.",
        concepts: ["JSX & Components", "State & Props", "Hooks (useEffect, useState)", "Context API & State Management"],
        docs: "https://react.dev",
        tutorials: [
          { title: "Official React Quick Start Guide", url: "https://react.dev/learn" },
          { title: "React JS Course - FreeCodeCamp", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" }
        ],
        practice: [
          { title: "Scrimba React Course Sandbox", url: "https://scrimba.com/learn/learnreact" }
        ]
      },
      {
        id: "backend-api",
        label: "Backend & Database APIs",
        description: "Architect secure servers, configure routing, and integrate databases to store dynamic data.",
        concepts: ["Node.js & Express", "RESTful Routing", "NoSQL (MongoDB) vs Relational SQL", "Authentication & JWT"],
        docs: "https://nodejs.org/en/docs",
        tutorials: [
          { title: "Node.js & Express Tutorial - FreeCodeCamp", url: "https://www.youtube.com/watch?v=Oe421EPjeBE" }
        ],
        practice: [
          { title: "Building CRUD APIs - FreeCodeCamp", url: "https://www.freecodecamp.org/learn/back-end-development-and-apis" }
        ]
      }
    ]
  },
  ai_ml: {
    title: "AI & Machine Learning",
    description: "From data wrangling to complex deep neural networks. Embark on the AI revolution.",
    nodes: [
      {
        id: "python-basics",
        label: "Python Programming & Setup",
        description: "Learn the foundational programming language for AI/ML development. Set up virtual environments, master OOP concepts, file operations, and code organization.",
        concepts: ["Virtual Environments (venv/conda)", "Data Structures (Lists, Dicts, Sets)", "Object-Oriented Programming (OOP)", "File Input/Output", "Packages & Modules"],
        docs: "https://docs.python.org/3/",
        tutorials: [
          { title: "Python for Everybody - freeCodeCamp", url: "https://www.youtube.com/watch?v=8DvywoWv6fI" },
          { title: "Modern Python Playlist - Corey Schafer", url: "https://www.youtube.com/playlist?list=PL-osiE80TeTskrapRyY7q5RYAsge0rygB" }
        ],
        practice: [
          { title: "HackerRank Python Track", url: "https://www.hackerrank.com/domains/python" },
          { title: "Exercism Python Track", url: "https://exercism.org/tracks/python" }
        ]
      },
      {
        id: "math-foundations",
        label: "Mathematics & Theory Foundations",
        description: "Master the fundamental mathematics backing advanced learning models: Linear Algebra, Multivariate Calculus, Probability, and Statistics.",
        concepts: ["Linear Algebra (Matrices, Vectors, Eigenvalues)", "Calculus (Derivatives, Gradients, Chain Rule)", "Probability Distributions (Normal, Binomial)", "Hypothesis Testing & Descriptive Statistics"],
        docs: "https://khanacademy.org/math",
        tutorials: [
          { title: "Mathematics for Machine Learning - Coursera", url: "https://www.coursera.org/specializations/mathematics-machine-learning" },
          { title: "Essence of Linear Algebra - 3Blue1Brown", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" }
        ],
        practice: [
          { title: "Desmos Matrix Playground", url: "https://www.desmos.com/matrix" },
          { title: "Khan Academy Math Sandbox", url: "https://www.khanacademy.org/math/statistics-probability" }
        ]
      },
      {
        id: "data-manipulation",
        label: "Data Science Tools: NumPy & Pandas",
        description: "Load, parse, manipulate, and organize massive real-world datasets utilizing industry-standard high-performance computing structures.",
        concepts: ["NumPy N-Dimensional Arrays", "Vectorization & Matrix Operations", "Pandas DataFrames & Series", "Indexing, Merging, & Grouping", "Jupyter Notebooks Environments"],
        docs: "https://pandas.pydata.org/docs/",
        tutorials: [
          { title: "Jupyter Notebook Tutorial - Corey Schafer", url: "https://www.youtube.com/watch?v=HW29067qVWk" },
          { title: "Pandas and NumPy for Beginners - Keith Galli", url: "https://www.youtube.com/watch?v=vmEHCJof1kU" }
        ],
        practice: [
          { title: "Kaggle Pandas Micro-Course", url: "https://www.kaggle.com/learn/pandas" },
          { title: "NumPy Exercises on GitHub", url: "https://github.com/rougier/numpy-100" }
        ]
      },
      {
        id: "data-visualization",
        label: "Data Visualization: Matplotlib & Seaborn",
        description: "Build graphical insights, plots, and charts to convey complex data patterns and distribution characteristics visually.",
        concepts: ["Matplotlib Figure & Axes", "Line, Bar, Scatter & Histogram Plots", "Seaborn Distribution Plots", "Heatmaps & Correlation Matrices", "Customizing Styles & Palettes"],
        docs: "https://seaborn.pydata.org",
        tutorials: [
          { title: "Data Visualization Masterclass - Simplilearn", url: "https://www.youtube.com/watch?v=3g8qP5rE-uQ" }
        ],
        practice: [
          { title: "Kaggle Data Visualization Course", url: "https://www.kaggle.com/learn/data-visualization" }
        ]
      },
      {
        id: "data-handling",
        label: "Data Cleaning, EDA & SQL Basics",
        description: "Establish data cleanliness by imputing null variables, querying databases, exploring features, and formulating feature schemas.",
        concepts: ["Data Imputation (Mean, Median, Mode)", "Outlier Detection & Filtering", "Exploratory Data Analysis (EDA)", "Feature Engineering (One-Hot Encoding, Scaling)", "SQL Database Queries (SELECT, JOIN, GROUP BY)"],
        docs: "https://www.postgresql.org/docs/",
        tutorials: [
          { title: "SQL for Data Science - freeCodeCamp", url: "https://www.youtube.com/watch?v=HXTtLSGgEgc" },
          { title: "Feature Engineering Techniques Guide", url: "https://www.kaggle.com/learn/feature-engineering" }
        ],
        practice: [
          { title: "SQL Practice Exercises - SQLZoo", url: "https://sqlzoo.net" },
          { title: "Kaggle EDA Playgrounds", url: "https://www.kaggle.com/code" }
        ]
      },
      {
        id: "ml-fundamentals",
        label: "Classical Machine Learning Foundations",
        description: "Master Scikit-Learn to train classical models, map supervised/unsupervised tasks, and address classification/regression issues.",
        concepts: ["Supervised vs Unsupervised Learning", "Scikit-Learn API & Workflow", "Linear & Logistic Regression", "Decision Trees & Random Forests", "Bias-Variance Trade-off & Overfitting"],
        docs: "https://scikit-learn.org/stable/",
        tutorials: [
          { title: "Machine Learning Zoomcamp", url: "https://github.com/DataTalksClub/machine-learning-zoomcamp" },
          { title: "ML for Beginners - StatQuest", url: "https://www.youtube.com/playlist?list=PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF" }
        ],
        practice: [
          { title: "Kaggle Spaceship Titanic Competition", url: "https://www.kaggle.com/competitions/spaceship-titanic" }
        ]
      },
      {
        id: "model-evaluation",
        label: "Model Validation & Hyperparameters",
        description: "Evaluate machine learning performance accurately, cross-validate datasets, analyze metrics, and optimize hyperparameter parameters.",
        concepts: ["Cross-Validation (K-Fold)", "Evaluation Metrics (Accuracy, F1-Score, ROC-AUC)", "Confusion Matrix & Classification Report", "Hyperparameter Tuning (GridSearch, RandomizedSearch)", "Precision-Recall Trade-off"],
        docs: "https://scikit-learn.org/stable/modules/model_evaluation.html",
        tutorials: [
          { title: "Model Evaluation Tutorial - freeCodeCamp", url: "https://www.youtube.com/watch?v=85dtiMz9tSo" }
        ],
        practice: [
          { title: "Kaggle Model Evaluation Exercises", url: "https://www.kaggle.com/code/dansbecker/underfitting-and-overfitting" }
        ]
      },
      {
        id: "unsupervised-learning",
        label: "Unsupervised Learning & Clustering",
        description: "Discover hidden structures within unlabeled datasets using clustering and dimensionality reduction algorithms.",
        concepts: ["K-Means Clustering & Elbow Method", "Hierarchical & DBSCAN Clustering", "Principal Component Analysis (PCA)", "t-SNE Dimensionality Reduction", "Anomaly Detection Basics"],
        docs: "https://scikit-learn.org/stable/unsupervised_learning.html",
        tutorials: [
          { title: "Unsupervised Learning - Stanford Online / Andrew Ng", url: "https://www.youtube.com/watch?v=5zMhMsswK6E" }
        ],
        practice: [
          { title: "Clustering Algorithms Practice - Kaggle", url: "https://www.kaggle.com/code/shrutimechlearn/step-by-step-kmeans-explained-in-detail" }
        ]
      },
      {
        id: "dl-neurons",
        label: "Deep Learning & Neural Network Basics",
        description: "Embark on Deep Learning: code artificial perceptrons, compute forward/backward propagation, and learn activation math.",
        concepts: ["Biological vs Artificial Neurons", "Single & Multi-Layer Perceptrons", "Activation Functions (Sigmoid, Tanh, ReLU, Softmax)", "Forward & Backward Propagation", "Loss Functions & Optimization (Gradient Descent, Adam)"],
        docs: "https://pytorch.org/docs/stable/index.html",
        tutorials: [
          { title: "Neural Networks 3Blue1Brown Series", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi" },
          { title: "Deep Learning Specialization - Andrew Ng", url: "https://www.deeplearning.ai/courses/deep-learning-specialization/" }
        ],
        practice: [
          { title: "TensorFlow Playground Interactive NN", url: "https://playground.tensorflow.org" }
        ]
      },
      {
        id: "dl-frameworks",
        label: "DL Frameworks: TensorFlow & PyTorch",
        description: "Construct, compile, and train deep artificial networks using high-level DL frameworks: TensorFlow and PyTorch.",
        concepts: ["Tensors, Dimensions & Graph Computations", "PyTorch Autograd & Computational Graph", "Building Custom Layers & Modules", "Model Compiling, Callbacks & Optimizers", "Training Loop & Validation Execution"],
        docs: "https://pytorch.org/tutorials/",
        tutorials: [
          { title: "PyTorch for Deep Learning Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=V_xro1bcAuA" },
          { title: "TensorFlow 2.0 Complete Course", url: "https://www.youtube.com/watch?v=tPYj3fFJGjk" }
        ],
        practice: [
          { title: "PyTorch Basics Exercises - PyTorch.org", url: "https://pytorch.org/tutorials/beginner/basics/intro.html" }
        ]
      },
      {
        id: "dl-architectures",
        label: "Deep Learning Architectures: CNNs, RNNs & Transformers",
        description: "Implement advanced deep models: CNNs for visual recognition, RNNs for sequential processing, and Transformers for textual understanding.",
        concepts: ["Convolutional Neural Networks (CNNs) & Pooling", "Image Classification & Feature Extraction", "Recurrent Neural Networks (RNNs) & LSTMs", "Self-Attention Mechanism & Transformers", "BERT & GPT Foundations"],
        docs: "https://huggingface.co/docs/transformers/index",
        tutorials: [
          { title: "CNNs for Visual Recognition - Stanford CS231n", url: "http://cs231n.stanford.edu" },
          { title: "Hugging Face NLP Course", url: "https://huggingface.co/learn/nlp-course" }
        ],
        practice: [
          { title: "MNIST Image Classification on Kaggle", url: "https://www.kaggle.com/competitions/digit-recognizer" },
          { title: "Hugging Face Transformers Playground", url: "https://huggingface.co/spaces" }
        ]
      }
    ]
  },
  cloud: {
    title: "Cloud Computing",
    description: "Design highly-available, scalable systems using cloud services and robust DevOps techniques.",
    nodes: [
      {
        id: "networking-basics",
        label: "Networking & Linux Fundamentals",
        description: "Master IP routing, subnets, standard OS operations, and Bash scripting protocols.",
        concepts: ["OSI Model & TCP/IP", "Linux Terminal Commands", "Bash Scripting", "SSH & Key Authentication"],
        docs: "https://linux.org/docs",
        tutorials: [
          { title: "Linux Command Line Basics - freeCodeCamp", url: "https://www.youtube.com/watch?v=wBp0Rb-ZJak" }
        ],
        practice: [
          { title: "Linux Practice Arena - OverTheWire", url: "https://overthewire.org/wargames/bandit/" }
        ]
      },
      {
        id: "cloud-providers",
        label: "Cloud Infrastructures (AWS/GCP)",
        description: "Learn compute virtualization, modern object storage systems, and cloud permissions management.",
        concepts: ["Virtual Servers (EC2/Compute Engine)", "Storage Systems (S3/Cloud Storage)", "IAM Security Policies", "VPC & Subnets Configuration"],
        docs: "https://docs.aws.amazon.com",
        tutorials: [
          { title: "AWS Certified Cloud Practitioner - freeCodeCamp", url: "https://www.youtube.com/watch?v=SOTamWGuDKc" }
        ],
        practice: [
          { title: "AWS Free Tier Hands-On Labs", url: "https://aws.amazon.com/getting-started/hands-on/" }
        ]
      },
      {
        id: "containers",
        label: "Containers (Docker)",
        description: "Build robust, isolated runtime environments ensuring parity between local development and production systems.",
        concepts: ["Dockerfiles & Image Building", "Docker Volumes & Data Persistence", "Docker Compose Multi-Container", "Container Registries (DockerHub)"],
        docs: "https://docs.docker.com",
        tutorials: [
          { title: "Docker Course for Beginners - Nana Janashia", url: "https://www.youtube.com/watch?v=3c-iBn73dDE" }
        ],
        practice: [
          { title: "Docker Playground Interactive Sandbox", url: "https://labs.play-with-docker.com" }
        ]
      },
      {
        id: "infrastructure-as-code",
        label: "Infrastructure as Code (Terraform)",
        description: "Declare, build, version, and manage virtual clouds cleanly using configuration code files.",
        concepts: ["Declarative Configs", "Terraform Providers & State Files", "Resource Provisioning", "Variables & Modules"],
        docs: "https://developer.hashicorp.com/terraform/docs",
        tutorials: [
          { title: "Terraform Course - FreeCodeCamp", url: "https://www.youtube.com/watch?v=SLB_c_ayRMc" }
        ],
        practice: [
          { title: "HashiCorp Hands-On Tutorials", url: "https://developer.hashicorp.com/terraform/tutorials" }
        ]
      },
      {
        id: "kubernetes",
        label: "Orchestration & Kubernetes (K8s)",
        description: "Deploy, auto-scale, load-balance, and manage cluster deployments in enterprise setups.",
        concepts: ["Pods & Deployments Services", "K8s Architecture & Control Planes", "Ingress Controllers", "Helm Charts for Package Management"],
        docs: "https://kubernetes.io/docs/home/",
        tutorials: [
          { title: "Kubernetes Tutorial for Beginners", url: "https://www.youtube.com/watch?v=X48VuDVv0do" }
        ],
        practice: [
          { title: "Play with Kubernetes Sandbox", url: "https://labs.play-with-k8s.com" }
        ]
      }
    ]
  },
  android: {
    title: "Android App Development",
    description: "Build responsive, premium native applications for mobile devices powered by Android.",
    nodes: [
      {
        id: "kotlin-basics",
        label: "Kotlin Programming",
        description: "Master the type-safe, concise, and standard language officially approved for modern Android apps.",
        concepts: ["Null Safety Syntax", "Coroutines & Async", "Object-Oriented Kotlin", "Data Classes & Collections"],
        docs: "https://kotlinlang.org/docs/home.html",
        tutorials: [
          { title: "Kotlin Bootcamp for Programmers - Udacity", url: "https://www.udacity.com/course/kotlin-bootcamp-for-programmers--ud9011" }
        ],
        practice: [
          { title: "Kotlin Playground online", url: "https://play.kotlinlang.org" }
        ]
      },
      {
        id: "android-studio",
        label: "Android Studio & XML Layouts",
        description: "Configure workspace structures, manage SDK configurations, and construct visual designs using XML.",
        concepts: ["Activity & Fragment Lifecycles", "ConstraintLayout Designs", "Views & ViewBinding", "Manifest & App permissions"],
        docs: "https://developer.android.com/studio/intro",
        tutorials: [
          { title: "Android Development Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=fis26HvvDII" }
        ],
        practice: [
          { title: "Codelabs for Android Basics", url: "https://developer.android.com/courses/android-basics-kotlin/course" }
        ]
      },
      {
        id: "jetpack-compose",
        label: "Jetpack Compose (Modern UI)",
        description: "Design beautiful, declarative UI layouts using native Kotlin modules without XML files.",
        concepts: ["Declarative UI paradigm", "State Hoisting & Remember", "Modifiers & Styling", "Compose Theme Customization"],
        docs: "https://developer.android.com/jetpack/compose",
        tutorials: [
          { title: "Jetpack Compose Tutorial - Philipp Lackner", url: "https://www.youtube.com/playlist?list=PLQkwcJGIPacTjWDXC8-VJkdyP8kPrus4v" }
        ],
        practice: [
          { title: "Jetpack Compose Pathways", url: "https://developer.android.com/courses/pathways/compose" }
        ]
      },
      {
        id: "networking-persistence",
        label: "Data Fetching & Local Databases",
        description: "Fetch real-time data using Retrofit APIs and manage persistent local caches using Room SQL databases.",
        concepts: ["Retrofit API integrations", "JSON serialization (Gson/Moshi)", "Room Database & DAOs", "Repository Design Pattern"],
        docs: "https://developer.android.com/training/data-storage/room",
        tutorials: [
          { title: "Retrofit & Room Tutorial - Philipp Lackner", url: "https://www.youtube.com/watch?v=tI99ZcR6Z7Y" }
        ],
        practice: [
          { title: "Building a caching News App from scratch", url: "https://developer.android.com/codelabs/basic-android-kotlin-training-room-database" }
        ]
      },
      {
        id: "architecture-patterns",
        label: "Android Architecture (MVVM)",
        description: "Create highly testable, decoupled apps using clean MVVM architectures and robust Dependency Injection (Hilt).",
        concepts: ["MVVM architecture pattern", "LiveData & StateFlow", "Hilt Dependency Injection", "Unit Testing ViewModels"],
        docs: "https://developer.android.com/topic/architecture",
        tutorials: [
          { title: "Hilt Dependency Injection Course", url: "https://www.youtube.com/watch?v=kiN4Fp9Z0hI" }
        ],
        practice: [
          { title: "Refactoring standard structures to MVVM Hilt", url: "https://developer.android.com/codelabs/android-hilt" }
        ]
      }
    ]
  },
  cybersecurity: {
    title: "Cybersecurity",
    description: "Guard network borders, secure web instances, and master penetration testing tactics.",
    nodes: [
      {
        id: "security-networking",
        label: "Network Protocols & Analysis",
        description: "Deep dive into routers, switches, network packets, and traffic sniffing methods.",
        concepts: ["Subnets & IP Addressing", "Common Ports (SSH, HTTP, FTP)", "Packet Sniffing (Wireshark)", "IDS/IPS Systems"],
        docs: "https://www.wireshark.org/docs/",
        tutorials: [
          { title: "Cybersecurity Foundations - NetworkChuck", url: "https://www.youtube.com/playlist?list=PLIhvC56v6wQYk2qM2G0fXUu2W1aGv7jLh" }
        ],
        practice: [
          { title: "Analyzing PCAP files - Wireshark practice", url: "https://www.wireshark.org/download.html" }
        ]
      },
      {
        id: "system-security",
        label: "Linux Security & Scripting",
        description: "Configure absolute host protections, manage user/group privileges, and create automation scripts.",
        concepts: ["Access Control Lists (ACLs)", "Firewall configuration (UFW/IPTables)", "Privilege Escalation paths", "Python for OS Automation"],
        docs: "https://tldp.org/LDP/sag/html/index.html",
        tutorials: [
          { title: "Linux Privilege Escalation - Tib3rius", url: "https://www.udemy.com/course/linux-privilege-escalation/" }
        ],
        practice: [
          { title: "Linux Wargames - OverTheWire Bandit", url: "https://overthewire.org" }
        ]
      },
      {
        id: "web-app-pentesting",
        label: "Web Application Security (OWASP Top 10)",
        description: "Audit frontend interfaces and backend configurations to mitigate SQL injections, XSS, and broken authentications.",
        concepts: ["SQL Injection (SQLi)", "Cross-Site Scripting (XSS)", "CSRF & Broken Auth", "Burp Suite Proxies"],
        docs: "https://owasp.org/www-project-top-ten/",
        tutorials: [
          { title: "OWASP Top 10 tutorial - freeCodeCamp", url: "https://www.youtube.com/watch?v=2fFEQD3A158" }
        ],
        practice: [
          { title: "DVWA (Damn Vulnerable Web App)", url: "https://github.com/digininja/DVWA" },
          { title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" }
        ]
      },
      {
        id: "penetration-testing",
        label: "Penetration Testing (Ethical Hacking)",
        description: "Discover network vulnerabilities, execute payloads, bypass firewalls, and document findings.",
        concepts: ["Reconnaissance (Nmap)", "Vulnerability Scanning", "Metasploit Framework", "Post-Exploitation Tactics"],
        docs: "https://www.offensive-security.com",
        tutorials: [
          { title: "Ethical Hacking Course - freeCodeCamp", url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE" }
        ],
        practice: [
          { title: "TryHackMe Learning Paths", url: "https://tryhackme.com" },
          { title: "Hack The Box Labs", url: "https://www.hackthebox.com" }
        ]
      },
      {
        id: "defense-ops",
        label: "Digital Forensics & Incident Response",
        description: "Establish defense parameters, analyze infected server images, check event logs, and trace bad actors.",
        concepts: ["SIEM (Splunk)", "Log File Analysis", "Malware Sandbox execution", "Incident Response playbooks"],
        docs: "https://docs.splunk.com",
        tutorials: [
          { title: "Blue Team Fundamentals - Security Blue Team", url: "https://securityblue.team" }
        ],
        practice: [
          { title: "Incident Response Labs - CyberDefenders", url: "https://cyberdefenders.org" }
        ]
      }
    ]
  }
};
