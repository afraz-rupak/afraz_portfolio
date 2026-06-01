/* =========================================================================
   data.js — single source of truth. Edit these arrays to update the site.
   ========================================================================= */

const PROFILE = {
  name: "Afraz Ul Haque",
  shortName: "Afraz",
  initials: "AH",
  title: "Machine Learning Researcher · AI Developer · Data Science",
  tagline: "ML Engineer & AI Researcher",
  location: "Sydney, NSW, Australia",
  summary:
    "I build intelligent systems that solve real-world problems — across computer vision, NLP, and deep learning. Currently a Master's researcher in Data Science & Innovation at the University of Technology Sydney, with industry experience shipping production ML.",
  longSummary:
    "Master's student in Data Science & Innovation at UTS with professional experience as a Python Developer & ML Engineer. My work spans medical imaging, vision-language models, and IoT-integrated AI — from research papers to deployed production APIs. I care about systems that are accurate, explainable, and genuinely useful.",
  mission:
    "To contribute to cutting-edge AI research and build ML solutions that move from the lab into the real world — responsibly, transparently, and with measurable impact.",
  email: "afrazulhaque865@gmail.com",
  phone: "+61 425 196 073",
  cvUrl: "https://flowcv.com/resume/fsg7i9h1bakm",
  links: {
    github: "https://github.com/afraz-rupak",
    linkedin: "https://www.linkedin.com/in/afraz-ul-haque-rupak-89b8a1194/",
    scholar: "https://scholar.google.com/citations?user=tQ4Ur6UAAAAJ&hl=en",
    researchgate: "#",
    orcid: "#",
  },
};

/* Headline stats for the data-rich hero */
const STATS = [
  { value: 14,  suffix: "",  label: "Publications", sub: "IEEE / Springer" },
  { value: 38,  suffix: "+", label: "Citations", sub: "ResearchGate" },
  { value: 3,   suffix: "",  label: "Production APIs", sub: "99.5% uptime" },
  { value: 3,   suffix: "+", label: "Years in research", sub: "since 2021" },
];

const FOCUS_AREAS = [
  { name: "Machine Learning", note: "Classical & ensemble methods" },
  { name: "Deep Learning", note: "CNNs, Transformers, transfer learning" },
  { name: "Computer Vision", note: "Detection, classification, medical imaging" },
  { name: "Natural Language Processing", note: "Embeddings, LLMs, chatbots" },
  { name: "Explainable AI", note: "Grad-CAM, model transparency" },
  { name: "Medical AI", note: "Diagnostic imaging pipelines" },
  { name: "Vision-Language Models", note: "Multi-modal learning, VQA" },
  { name: "IoT + AI", note: "Edge inference, smart agriculture" },
];

/* ---------- Projects ---------- */
const PROJECTS = [
  {
    id: "vehicle-metadata",
    title: "Vehicle Metadata Identification",
    category: "Computer Vision",
    org: "Industry research · NSW Police",
    featured: true,
    cover: "assets/img/vehicle-metadata.png",
    short: "Automated vehicle classification and attribute detection for law-enforcement workflows.",
    problem: "Manual vehicle identification is slow and inconsistent. The goal was real-time classification of make, model, body type and colour, plus fine-grained attributes like roof racks, decals and damage.",
    dataset: "Proprietary vehicle imagery dataset (industry-supplied).",
    method: "Ensemble of YOLO and Faster R-CNN detectors with Vision Transformer (ViT) classification heads; optimised for inference speed on production hardware.",
    tech: ["Python", "PyTorch", "YOLO", "Faster R-CNN", "ViT", "OpenCV"],
    results: [
      { k: "Attributes", v: "make · model · colour · body" },
      { k: "Mode", v: "Real-time inference" },
      { k: "Status", v: "Deployed to production" },
    ],
    links: { github: "#", paper: null, demo: null },
  },
  {
    id: "cattle-health",
    title: "Cattle Health Monitoring System",
    category: "IoT + ML",
    org: "InflexionPoint Technologies",
    featured: true,
    cover: "assets/img/cattle-health.png",
    short: "End-to-end IoT + ML platform for real-time livestock health tracking and predictive alerts.",
    problem: "Farms lacked early-warning signals for animal health. The system needed to fuse sensor streams with vision to predict health events and recommend interventions.",
    dataset: "IoT sensor time-series + cattle imagery (muzzle prints).",
    method: "TensorFlow models over IoT sensor fusion with automated alerting, a food-recommendation engine, and growth/breeding prediction. Deployed on AWS EC2.",
    tech: ["Python", "TensorFlow", "OpenCV", "AWS EC2", "IoT"],
    results: [
      { k: "Uptime", v: "99.5%" },
      { k: "Features", v: "alerts · diet · breeding" },
      { k: "Stack", v: "IoT → cloud → API" },
    ],
    links: { github: "#", paper: null, demo: null },
  },
  {
    id: "cattle-face",
    title: "Cattle Face Verification API",
    category: "Computer Vision",
    org: "InflexionPoint Technologies",
    featured: true,
    cover: "assets/img/cattle-face.png",
    short: "Non-invasive cattle identification using muzzle-print recognition — biometric ID for livestock.",
    problem: "Traditional livestock tagging is invasive and error-prone. Muzzle prints are unique per animal, like fingerprints — ideal for non-invasive verification.",
    dataset: "Cattle muzzle-print image collection.",
    method: "TensorFlow + OpenCV feature pipeline exposed as a RESTful API on AWS, scaled for high daily request volume.",
    tech: ["Python", "TensorFlow", "OpenCV", "AWS EC2", "REST API"],
    results: [
      { k: "Accuracy", v: "97%" },
      { k: "Throughput", v: "1000+ req/day" },
      { k: "Delivery", v: "Production API" },
    ],
    links: { github: "#", paper: null, demo: null },
  },
  {
    id: "brain-tumor",
    title: "Brain Tumor Classification (MobileNet-ViT)",
    category: "Medical AI",
    org: "Research",
    featured: false,
    cover: "assets/img/brain-tumor.png",
    short: "Hybrid MobileNet-ViT classifier with Grad-CAM visual explainability for MRI scans.",
    problem: "Clinicians need accurate and interpretable tumor classification — a black-box model is not enough for diagnostic trust.",
    dataset: "Public brain MRI tumor dataset.",
    method: "MobileNet feature extractor fused with a Vision Transformer head; Grad-CAM heatmaps surface the regions driving each prediction.",
    tech: ["Python", "TensorFlow", "ViT", "Grad-CAM"],
    results: [
      { k: "Venue", v: "RTIP2R 2025 · Springer" },
      { k: "Explainability", v: "Grad-CAM overlays" },
    ],
    links: { github: "#", paper: "#", demo: null },
  },
  {
    id: "pneumonia",
    title: "Pneumonia Identification in Chest X-rays",
    category: "Medical AI",
    org: "Research",
    featured: false,
    cover: "assets/img/pneumonia.png",
    short: "Deep-learning strategies for detecting pneumonia from chest radiographs.",
    problem: "Early, reliable pneumonia screening from X-rays can support overstretched radiology workflows.",
    dataset: "Public chest X-ray pneumonia dataset.",
    method: "Comparative deep CNN strategies with transfer learning for robust classification.",
    tech: ["Python", "TensorFlow", "CNN", "Transfer Learning"],
    results: [{ k: "Venue", v: "ICCCNT 2024 · IEEE" }],
    links: { github: "#", paper: "#", demo: null },
  },
  {
    id: "skin-cancer",
    title: "AI Dermatologist — Skin Cancer Detection",
    category: "Medical AI",
    org: "Research",
    featured: false,
    cover: "assets/img/skin-cancer.png",
    short: "Deep-learning classifier for skin-lesion / skin-cancer detection from dermatoscopic images.",
    problem: "Accessible pre-screening for skin cancer could widen reach in under-served settings.",
    dataset: "Dermatoscopic skin-lesion dataset.",
    method: "CNN classifier with transfer learning and augmentation for lesion categorisation.",
    tech: ["Python", "TensorFlow", "CNN"],
    results: [{ k: "Venue", v: "ICCCNT 2024 · IEEE" }],
    links: { github: "#", paper: "#", demo: null },
  },
  {
    id: "bangla-chatbot",
    title: "Bangla Chatbot — Hybrid BERT-GPT-2",
    category: "NLP",
    org: "B.Sc. Thesis · DIU",
    featured: false,
    short: "Hybridized BERT-GPT-2 architecture for empowering conversational AI in Bangla.",
    problem: "Low-resource languages like Bangla lack strong conversational models; a hybrid encoder-decoder approach can bridge understanding and generation.",
    dataset: "Bangla conversational corpus.",
    method: "BERT for understanding fused with GPT-2 for generation, fine-tuned for coherent Bangla responses.",
    tech: ["Python", "PyTorch", "BERT", "GPT-2", "Transformers"],
    results: [{ k: "Type", v: "Undergraduate thesis" }, { k: "Focus", v: "Low-resource NLP" }],
    links: { github: "#", paper: null, demo: null },
  },
  {
    id: "fake-news",
    title: "Fake News Detection",
    category: "NLP",
    org: "Open source",
    featured: false,
    short: "Classifying news articles as real or fake using classical ML and text features.",
    problem: "Misinformation spreads fast; lightweight classifiers can flag suspect articles at scale.",
    dataset: "Public fake-news text dataset (Kaggle).",
    method: "TF-IDF features with classical ML classifiers and evaluation across metrics.",
    tech: ["Python", "Scikit-learn", "NLP", "Pandas"],
    results: [{ k: "Approach", v: "TF-IDF + ML" }],
    links: { github: "https://github.com/afraz-rupak/fake-news-detection-using-machine-learning", paper: null, demo: null },
  },
  {
    id: "superstore-forecast",
    title: "Superstore Sales Forecasting",
    category: "Data Analysis",
    org: "Open source",
    featured: false,
    short: "Time-series sales forecasting comparing ARIMA, Facebook Prophet, and LSTM.",
    problem: "Retail planning needs reliable demand forecasts; comparing statistical and deep models reveals trade-offs.",
    dataset: "Superstore retail sales dataset.",
    method: "Benchmarked ARIMA, Prophet and an LSTM network on the same series; compared accuracy and behaviour.",
    tech: ["Python", "LSTM", "ARIMA", "Prophet", "Pandas"],
    results: [{ k: "Models", v: "ARIMA · Prophet · LSTM" }],
    links: { github: "https://github.com/afraz-rupak/Superstore-Sales-time-series-forecasting-by-using-ARIMA-Model-Facebook-Prophet-Model-and-LSTM-Model", paper: null, demo: null },
  },
  {
    id: "heart-failure",
    title: "Heart Failure Prediction",
    category: "Machine Learning",
    org: "Open source",
    featured: false,
    short: "Predicting heart-failure risk from clinical records using ML classifiers.",
    problem: "Early risk stratification can support clinical decisions; tabular ML models offer interpretable baselines.",
    dataset: "Heart-failure clinical records (Kaggle).",
    method: "Feature engineering with ensemble and linear classifiers; evaluated with appropriate clinical metrics.",
    tech: ["Python", "Scikit-learn", "XGBoost", "Pandas"],
    results: [{ k: "Task", v: "Binary risk prediction" }],
    links: { github: "https://github.com/afraz-rupak/Heart-Failure-Prediction-using-kaggle-dataset", paper: null, demo: null },
  },
];

const PROJECT_CATEGORIES = ["All", "Computer Vision", "NLP", "Medical AI", "Machine Learning", "Data Analysis", "IoT + ML"];

/* ---------- Publication metrics (from ResearchGate / Google Scholar) ---------- */
const SCHOLAR_METRICS = [
  { value: 14, suffix: "", label: "Publications", sub: "peer-reviewed" },
  { value: 38, suffix: "", label: "Citations", sub: "and growing" },
  { value: 2231, suffix: "", label: "Reads", sub: "on ResearchGate" },
  { value: 4, suffix: "", label: "First-author", sub: "lead papers" },
];

/* ---------- Publications ----------
   Each: authors[] (the lead/highlighted "me" entry marked with isMe),
   role, venue (short), venueFull, type (publisher), year, month, tags,
   link (DOI / publisher page), note (one-line contribution / finding).      */
const ME = "Afraz Ul Haque Rupak";
const PUBLICATIONS = [
  {
    n: 1,
    title: "Brain Tumor Classification Using MobileNet-ViT with Visual Explainability through Grad-CAM",
    authors: [ME, "Sadman Sadik Khan", "Md Saifur Rahman", "Md Toufiq Imrog", "Andalib Rahman Rommo", "Rasel Parvez"],
    role: "First author",
    venue: "RTIP2R 2025",
    venueFull: "8th Intl. Conf. on Recent Trends in Image Processing & Pattern Recognition",
    type: "Springer",
    year: 2025, month: "Dec",
    tags: ["Computer Vision", "Medical AI", "Explainable AI"],
    note: "A hybrid MobileNet-ViT classifier for brain-MRI tumor types, with Grad-CAM heatmaps surfacing the regions behind each prediction.",
    link: "https://www.researchgate.net/profile/Afraz-Ul-Haque-Rupak/publications",
  },
  {
    n: 2,
    title: "DeepInsureAI: A Deep Learning-Based Vehicle Insurance Prediction Model",
    authors: ["Sadman Sadik Khan", "Md Shazedur Rahman", ME, "Md Sadekur Rahman"],
    role: "Co-author",
    venue: "ICEEE 2024",
    venueFull: "Intl. Conf. on Electrical and Electronics Engineering (Springer LNEE)",
    type: "Springer",
    year: 2025, month: "Jan",
    tags: ["Deep Learning", "Computer Vision"],
    note: "Comparative study of five pre-trained CNNs for vehicle-damage insurance assessment; InceptionV3 led at 97% accuracy on industry-validated data.",
    link: "https://link.springer.com/chapter/10.1007/978-981-97-9112-5_16",
  },
  {
    n: 3,
    title: "Advances in Medical Imaging: Deep Learning Strategies for Pneumonia Identification in Chest X-Rays",
    authors: ["Sadman Sadik Khan", ME, "Washik Wali Faieaz", "Sayma Jannat", "Nuzhat Noor Islam Prova", "Amit Kumar Gupta"],
    role: "Co-author",
    venue: "ICCCNT 2024",
    venueFull: "15th Intl. Conf. on Computing, Communication and Networking Technologies",
    type: "IEEE",
    year: 2024, month: "Jun",
    tags: ["Medical AI", "Deep Learning"],
    note: "Comparative deep-CNN strategies with transfer learning for robust pneumonia detection from chest radiographs.",
    link: "https://www.researchgate.net/profile/Afraz-Ul-Haque-Rupak/publications",
  },
  {
    n: 4,
    title: "AI Dermatologist: Skin Cancer Detection with Deep Learning Techniques",
    authors: [ME, "Sadman Sadik Khan", "Alaya Parvin Alo", "Rupa Ghosh", "Md Fatin Ishrak", "Md Sanowar Hossain Sabuj"],
    role: "First author",
    venue: "ICCCNT 2024",
    venueFull: "15th Intl. Conf. on Computing, Communication and Networking Technologies",
    type: "IEEE",
    year: 2024, month: "Jun",
    tags: ["Medical AI", "Computer Vision"],
    note: "Deep-learning classifier for skin-lesion / skin-cancer detection from dermatoscopic images, aimed at accessible pre-screening.",
    link: "https://www.researchgate.net/profile/Afraz-Ul-Haque-Rupak/publications",
  },
  {
    n: 5,
    title: "Multiple Nail-Disease Classification Based on Machine Vision Using Transfer Learning Approach",
    authors: ["Md Abrar Hamim", ME, "Md Sayed Hasan", "Kridita Ray"],
    role: "Co-author",
    venue: "ICCCNT 2023",
    venueFull: "Intl. Conf. on Computing, Communication and Networking Technologies",
    type: "IEEE",
    year: 2024, month: "Nov",
    tags: ["Computer Vision", "Transfer Learning"],
    note: "Machine-vision pipeline using transfer learning to classify nail diseases — human nails as early indicators of systemic illness.",
    link: "https://www.researchgate.net/profile/Afraz-Ul-Haque-Rupak/publications",
  },
  {
    n: 6,
    title: "Advancements in NLP and Machine Learning for Identifying Deepfake Text: Techniques and Challenges",
    authors: [ME, "Washik Wali Faieaz", "Amit Kumar Gupta"],
    role: "First author",
    venue: "Survey",
    venueFull: "Review of NLP & ML techniques for machine-generated text detection",
    type: "Review",
    year: 2025, month: "Apr",
    tags: ["NLP", "Machine Learning"],
    note: "A survey of NLP and ML approaches for detecting deepfake / machine-generated text, with an analysis of open challenges.",
    link: "https://www.researchgate.net/profile/Afraz-Ul-Haque-Rupak/publications",
  },
];

const RESEARCH_INTERESTS = [
  { area: "Computer Vision", topics: ["Object Detection", "Image Classification", "Medical Imaging", "Transfer Learning"] },
  { area: "Natural Language Processing", topics: ["Chatbots", "Text Generation", "Multilingual Models", "BERT-GPT-2 Hybrid"] },
  { area: "Vision-Language Models", topics: ["Multi-modal Learning", "Visual QA", "Image Captioning"] },
  { area: "IoT + AI", topics: ["Smart Agriculture", "Healthcare Monitoring", "Edge Computing"] },
];

const CURRENT_FOCUS = {
  heading: "Advanced ML architectures & Vision-Language Models",
  body: "My current research direction explores multi-modal learning — connecting vision and language — alongside efficient, explainable architectures for medical and edge-deployed AI. I'm particularly interested in models that remain interpretable without sacrificing accuracy.",
  institution: "University of Technology Sydney — Master of Data Science & Innovation",
};

/* ---------- Education ---------- */
const EDUCATION = [
  {
    degree: "Master of Data Science & Innovation",
    school: "University of Technology Sydney",
    place: "NSW, Australia",
    period: "Aug 2024 — Present",
    detail: "Research focus on advanced ML architectures and vision-language models.",
    current: true,
  },
  {
    degree: "B.Sc. in Computer Science & Engineering",
    school: "Daffodil International University",
    place: "Dhaka, Bangladesh",
    period: "May 2019 — Jun 2023",
    detail: "CGPA 3.78 / 4.00. Thesis: “Empowering Bangla Chatbots: A Hybridized BERT-GPT-2 Approach.” Supervisors: Md. Sadekur Rahman, Abu Kaisar Mohammad Masum.",
    current: false,
  },
];

const EXPERIENCE = [
  { role: "Python Developer & ML Engineer", org: "InflexionPoint Technologies BD Ltd", period: "Mar 2023 — Jan 2025", points: ["Built an end-to-end cattle health monitoring AI system with IoT integration.", "Developed a cattle identification API using muzzle-print verification.", "Deployed production models on AWS EC2 with MLOps practices."] },
  { role: "Researcher & ML / Data Science Trainer", org: "DIU NLP & ML Research Lab", period: "Jun 2021 — Present", points: ["Leading research projects in computer vision and NLP.", "Authored 5 research papers published in IEEE / Springer.", "Mentoring students through ML bootcamps."] },
  { role: "AI / ML Trainer (Part-time)", org: "EDGE — Govt. of Bangladesh", period: "Jun 2023 — Jan 2024", points: ["Trained 200+ government officials, IT professionals and students.", "Delivered workshops on Python, TensorFlow, PyTorch & Scikit-learn.", "Covered NLP, computer vision and predictive analytics."] },
];

/* ---------- Skills ---------- */
const SKILLS = [
  { group: "Programming Languages", items: ["Python", "C++", "JavaScript", "SQL"] },
  { group: "Machine Learning", items: ["Scikit-learn", "TensorFlow", "PyTorch", "Keras", "XGBoost", "LightGBM"] },
  { group: "Deep Learning", items: ["CNN", "RNN / LSTM", "Transformers", "Transfer Learning", "Vision Transformers"] },
  { group: "Computer Vision", items: ["OpenCV", "YOLO", "Faster R-CNN", "Grad-CAM", "Medical Imaging"] },
  { group: "NLP", items: ["Text Preprocessing", "Embeddings", "BERT / GPT-2", "LLMs", "Hugging Face"] },
  { group: "Data Science", items: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "PySpark"] },
  { group: "Cloud & Deployment", items: ["AWS", "Azure", "GCP", "Docker"] },
  { group: "Tools", items: ["Git / GitHub", "Jupyter", "Google Colab", "VS Code", "Databricks"] },
];

/* ---------- Blog ---------- */
const BLOGS = [
  { id: "gradcam", title: "Making CNNs Explainable with Grad-CAM", category: "Computer Vision", date: "2025-04-18", read: 8, summary: "Why heatmaps matter for medical AI, and a practical walkthrough of wiring Grad-CAM into a MobileNet-ViT classifier.", tags: ["Explainable AI", "Grad-CAM", "Medical AI"] },
  { id: "vit-intuition", title: "Vision Transformers, Explained for Practitioners", category: "Deep Learning", date: "2025-02-09", read: 11, summary: "Patches, attention, and why ViTs work — an intuition-first tour with the math kept gentle.", tags: ["Transformers", "Deep Learning"] },
  { id: "bert-gpt2", title: "Hybridizing BERT and GPT-2 for Low-Resource Chatbots", category: "NLP", date: "2024-12-02", read: 9, summary: "Lessons from my thesis on building a Bangla conversational model by fusing an encoder and a decoder.", tags: ["NLP", "BERT", "GPT-2"] },
  { id: "forecasting", title: "ARIMA vs Prophet vs LSTM: A Forecasting Field Guide", category: "Data Science", date: "2024-10-21", read: 7, summary: "A practical comparison of three forecasting approaches on the same retail series — when to reach for which.", tags: ["Time Series", "LSTM"] },
  { id: "mlops", title: "From Notebook to Production API on AWS", category: "MLOps", date: "2024-08-14", read: 10, summary: "How a cattle-identification model went from Colab experiment to a REST API serving 1000+ daily requests.", tags: ["MLOps", "AWS", "Deployment"] },
  { id: "reflections", title: "What Three Years in a Research Lab Taught Me", category: "Academic", date: "2024-06-30", read: 6, summary: "Reflections on mentoring, paper deadlines, and learning to ship research that survives peer review.", tags: ["Reflections", "Research"] },
];

const BLOG_CATEGORIES = ["All", "Computer Vision", "Deep Learning", "NLP", "Data Science", "MLOps", "Academic"];
