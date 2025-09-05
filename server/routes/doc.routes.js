const express = require("express");
const {auth} = require("../middlewares/authMiddleware");
const aiLimiter =require("../middlewares/rateLimit");
const Document = require("../model/document.model");
const  {crateDocController,
readDocController,
summarizeDocController,
updateDocController,
deleteDocController,
tagsController,
qnaController,singleDocController} = require("../controllers/doc.controller");
const router = express.Router();


router.get("/doc-cl",(req,res)=>{

    res.send("doc Routes ")
})

router.post("/create", auth,aiLimiter,crateDocController);
  
router.get("/",readDocController );
  
router.get('/:id', auth,singleDocController );

router.post("/:id/summarize",aiLimiter, summarizeDocController);
  
  // Update (owner or admin)
  router.patch('/:id', auth,updateDocController);
  
  // Delete (owner or admin)
  router.delete('/:id', auth,deleteDocController);
  router.post('/:id/tags', auth, aiLimiter,tagsController);
  router.post("/qa",aiLimiter,qnaController );
  
  
router.get("/tags", auth, async (req, res) => {
  try {

    const allTags = await Document.distinct("tags");
    res.json({ tags: allTags });
  } catch (err) {
    console.error("Error fetching tags:", err);
    res.status(500).json({ error: "Server error" });
  }
});
  
module.exports = router;