const express = require("express");
const router = express.Router();

const knowledgeAssistantController = require("../controllers/knowledgeAssistantController");

// AI Assistant
router.post("/query", knowledgeAssistantController.askQuestion);

// Natural Language Search
router.get("/search", knowledgeAssistantController.naturalSearch);

// Documentation
router.get("/documentation", knowledgeAssistantController.getDocumentation);

// Event Recommendations
router.get("/events", knowledgeAssistantController.getEventRecommendations);

// Club Information
router.get("/clubs", knowledgeAssistantController.getClubInformation);

// FAQ Generation
router.get("/faqs", knowledgeAssistantController.generateFAQs);

// Step-by-Step Guides
router.get("/guides", knowledgeAssistantController.getGuides);

// Smart Search Suggestions
router.get("/suggestions", knowledgeAssistantController.getSuggestions);

// Multilingual Translation
router.post("/translate", knowledgeAssistantController.translateResponse);

// Query History
router.get("/history", knowledgeAssistantController.getHistory);

// Feedback
router.post("/feedback", knowledgeAssistantController.submitFeedback);

// Analytics
router.get("/analytics", knowledgeAssistantController.getAnalytics);

// Knowledge Base Update
router.post("/update", knowledgeAssistantController.updateKnowledgeBase);

module.exports = router;