const { summarizeText, generateTags, embedText,cosineSim } = require("../services/gemini");
const {genAI} = require("../services/gemini");
const Document = require("../model/document.model");
const crateDocController =  async (req, res) => {
    try {
      const { title, content, tags } = req.body;
    //   console.log(req.body);
  
      const [summary, aiTags, embedding] = await Promise.all([
        summarizeText(content).catch(() => ""),
        generateTags(content).catch(() => []),
        embedText(`${title}\n\n${content}`).catch(() => []),
      ]);

      const doc = await Document.create({
        title,
        content,
        tags: Array.from(new Set([...(tags || []), ...(aiTags || [])])),
        summary,
        createdBy: req.user.id,
        embedding,
      });
  
      res.status(201).json(doc);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong", error });
    }
}

const readDocController = async (req, res) => {
    try {
      let { q, tag, author, limit = 20, page = 1, mode = "keyword", k = 5 } = req.query;
  
      const parsedLimit = parseInt(limit, 10) || 20;
      const parsedPage = parseInt(page, 10) || 1;
      const skip = (parsedPage - 1) * parsedLimit;
  
     
      if (mode === "keyword") {
        const filters = {};
  
        if (tag) filters.tags = tag;
        if (author) filters.createdBy = author;
        if (q) {
          filters.$or = [
            { title: new RegExp(q, "i") },
            { content: new RegExp(q, "i") },
            { tags: new RegExp(q, "i") },
          ];
        }
  
        const docs = await Document.find(filters)
          .populate("createdBy", "name role")
          .sort({ updatedAt: -1 })
          .limit(parsedLimit)
          .skip(skip);
  
        return res.json({ mode, results: docs });
      }
  
      if (mode === "semantic") {
        if (!q) return res.json({ mode, results: [] });

        const qEmbedding = await embedText(q);
        const docs = await Document.find({ embedding: { $exists: true } }).limit(200);
  
        const ranked = docs
          .map((doc) => ({
            ...doc.toObject(),
            score: cosineSim(qEmbedding, doc.embedding),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, parseInt(k, 10) || 5);
  
        return res.json({ mode, results: ranked });
      }

      return res.status(400).json({ message: "Invalid mode. Use 'keyword' or 'semantic'." });
  
    } catch (err) {
      console.error("Search error:", err);
      res.status(500).json({ message: "Server error" });
    }
}

const singleDocController = async (req,res)=> {
    try {
      const doc = await Document.findById(req.params.id).populate('createdBy','name role');
      if (!doc) return res.status(404).json({ message: 'Not found' });
      res.json(doc);
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
  }
const summarizeDocController = async (req, res) => {
    try {
       
      const doc = await Document.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: "Document not found" });
  
     
      const summary = await summarizeText(doc.content);
  
      doc.summary = summary;
      await doc.save();
  
      res.json({ summary });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}
const updateDocController = async (req, res) => {
    try {
      const doc = await Document.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({ message: "Not found" });
      }
  
      // ✅ Normalize userId from req.user
      const userId = req.user.id || req.user._id;
      const isOwner = doc.createdBy.toString() === userId?.toString();
      const isAdmin = req.user.role === "admin";

      console.log("isAdmin",req.user);
  
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
  
      const { title, content, tags } = req.body;
  
      if (title !== undefined) doc.title = title;
      if (content !== undefined) doc.content = content;
      if (tags !== undefined) doc.tags = tags;
  
      // Reset summary only if content changes
      if (content !== undefined) {
        doc.summary = "";
      }
  
      // Update embeddings if title/content changed
      if (title !== undefined || content !== undefined) {
        try {
          doc.embedding = await embedText(`${doc.title}\n\n${doc.content}`);
        } catch (e) {
          console.warn("Embedding failed, keeping old embedding");
        }
      }
  
      await doc.save();
      res.json(doc);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  

const deleteDocController =  async (req,res) => {
    try {
      const doc = await Document.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      const isOwner = doc.createdBy.toString() === req.user.id;
      if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
      await doc.deleteOne();
      res.json({ ok: true });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
}

const tagsController = async (req,res) => {
    try {
        console.log(req.params.id)
      const doc = await Document.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Not found' });
      const aiTags = await generateTags(doc.content).catch(()=>[]);
      doc.tags = Array.from(new Set([...(doc.tags||[]), ...(aiTags||[])]));
      await doc.save();
      res.json({ tags: doc.tags });
    } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
}

const qnaController = async (req, res) => {
    try {
      const { question, tags } = req.body;
      if (!question) {
        return res.status(400).json({ message: "Question required" });
      }
  
      // 1. Embed the question
      const qEmbedding = await embedText(question);
  
      // 2. Apply tag filters if any
      let filters = {};
      if (tags && tags.length > 0) {
        filters.tags = { $in: tags };
      }
  
      // Fetch candidate docs (with embeddings)
      const docs = await Document.find({
        ...filters,
        embedding: { $exists: true },
      }).limit(50);
  
      // 3. Rank docs by cosine similarity
      const ranked = docs
        .map((doc) => ({
          doc,
          score: cosineSim(qEmbedding, doc.embedding),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
  
      // 4. Build context for Gemini
      const context = ranked
        .map(
          (r) => `Title: ${r.doc.title}\nContent: ${r.doc.content}`
        )
        .join("\n\n");
  
      const prompt = `You are a helpful assistant for team knowledge base Q&A. 
  Answer the question based only on the context below. 
  If the answer is not present in the context, reply with "I could not find the answer in the docs."
  
  Context:
  ${context}
  
  Question: ${question}
  Answer:`;
  
      // 5. Call Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const resp = await model.generateContent(prompt);
  
      const answer =
        resp.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No answer generated.";
  
      // 6. Return answer + sources
      res.json({
        answer,
        sources: ranked.map((r) => ({
          id: r.doc._id,
          title: r.doc.title,
        })),
      });
    } catch (err) {
      console.error("Q&A error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  module.exports = {
    crateDocController,
    readDocController,
    summarizeDocController,
    updateDocController,
    deleteDocController,
    tagsController,
    qnaController,
    singleDocController
  }