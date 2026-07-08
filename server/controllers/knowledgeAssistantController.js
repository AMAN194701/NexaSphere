const knowledgeAssistantService = require("../services/knowledgeAssistantService");

// Ask AI Assistant
const askQuestion = async (req, res) => {
  try {
    const response = await knowledgeAssistantService.askQuestion(req.body);

    res.status(200).json({
      success: true,
      message: "Response generated successfully.",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate response.",
      error: error.message,
    });
  }
};

// Natural Language Search
const naturalSearch = async (req, res) => {
  try {
    const results = await knowledgeAssistantService.naturalSearch(req.query.q);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Search failed.",
      error: error.message,
    });
  }
};

// Documentation Search
const getDocumentation = async (req, res) => {
  try {
    const docs = await knowledgeAssistantService.getDocumentation(req.query.topic);

    res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch documentation.",
      error: error.message,
    });
  }
};

// Event Recommendations
const getEventRecommendations = async (req, res) => {
  try {
    const events = await knowledgeAssistantService.getEventRecommendations(
      req.query.userId
    );

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch event recommendations.",
      error: error.message,
    });
  }
};

// Club Information
const getClubInformation = async (req, res) => {
  try {
    const clubs = await knowledgeAssistantService.getClubInformation(
      req.query.club
    );

    res.status(200).json({
      success: true,
      data: clubs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch club information.",
      error: error.message,
    });
  }
};

// FAQ Generation
const generateFAQs = async (req, res) => {
  try {
    const faqs = await knowledgeAssistantService.generateFAQs();

    res.status(200).json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate FAQs.",
      error: error.message,
    });
  }
};

// Step-by-Step Guides
const getGuides = async (req, res) => {
  try {
    const guides = await knowledgeAssistantService.getGuides(req.query.topic);

    res.status(200).json({
      success: true,
      data: guides,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch guides.",
      error: error.message,
    });
  }
};

// Smart Search Suggestions
const getSuggestions = async (req, res) => {
  try {
    const suggestions = await knowledgeAssistantService.getSuggestions(
      req.query.q
    );

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions.",
      error: error.message,
    });
  }
};

// Translation
const translateResponse = async (req, res) => {
  try {
    const translated = await knowledgeAssistantService.translateResponse(
      req.body
    );

    res.status(200).json({
      success: true,
      data: translated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Translation failed.",
      error: error.message,
    });
  }
};

// Query History
const getHistory = async (req, res) => {
  try {
    const history = await knowledgeAssistantService.getHistory(
      req.query.userId
    );

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch history.",
      error: error.message,
    });
  }
};

// Feedback
const submitFeedback = async (req, res) => {
  try {
    const feedback = await knowledgeAssistantService.submitFeedback(req.body);

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback.",
      error: error.message,
    });
  }
};

// Analytics
const getAnalytics = async (req, res) => {
  try {
    const analytics = await knowledgeAssistantService.getAnalytics();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics.",
      error: error.message,
    });
  }
};

// Update Knowledge Base
const updateKnowledgeBase = async (req, res) => {
  try {
    const update = await knowledgeAssistantService.updateKnowledgeBase();

    res.status(200).json({
      success: true,
      message: "Knowledge base updated successfully.",
      data: update,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update knowledge base.",
      error: error.message,
    });
  }
};

module.exports = {
  askQuestion,
  naturalSearch,
  getDocumentation,
  getEventRecommendations,
  getClubInformation,
  generateFAQs,
  getGuides,
  getSuggestions,
  translateResponse,
  getHistory,
  submitFeedback,
  getAnalytics,
  updateKnowledgeBase,
};