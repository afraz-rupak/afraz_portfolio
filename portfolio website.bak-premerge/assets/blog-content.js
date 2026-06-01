/* =========================================================================
   blog-content.js — full article bodies, keyed by BLOGS[].id.

   Kept separate from data.js so the post list stays light. Each body is HTML
   with <h2> sections (the article page builds a table of contents from them).
   Loaded after data.js; the bodies are attached onto the BLOGS entries below.
   ========================================================================= */
const BLOG_CONTENT = {
  gradcam: `
    <p>A model that says "tumor" with 98% confidence is useless to a radiologist who can't see <em>why</em>. In medical AI, interpretability isn't a nice-to-have — it's the difference between a tool clinicians trust and one they quietly ignore. Grad-CAM is the simplest high-leverage technique I reach for to make a convolutional model show its work.</p>
    <h2>What Grad-CAM actually does</h2>
    <p>Gradient-weighted Class Activation Mapping takes the gradients of the target class flowing into the last convolutional layer, global-average-pools them into per-channel weights, and produces a coarse heatmap over the input. Bright regions are the pixels that pushed the prediction toward that class.</p>
    <p>Because it taps the final conv layer, the map is low-resolution but semantically rich — it highlights "the thing", not edges. Upsampling and overlaying it on the original scan gives you the familiar warm-on-cold heatmap.</p>
    <h2>Wiring it into a MobileNet-ViT</h2>
    <p>In a hybrid backbone, the trick is choosing the right layer to hook. For the MobileNet branch I target the last depthwise-separable block before pooling. You register a forward hook to capture activations and a backward hook to capture gradients, then combine them at inference time.</p>
    <p>Keep the hooks off the hot path in production — capture only when an explanation is requested, not on every forward pass.</p>
    <h2>Reading the heatmaps honestly</h2>
    <p>Grad-CAM tells you where the model looked, not whether it looked for the right reason. I've seen models latch onto scanner artifacts or text annotations baked into the image. Treat surprising heatmaps as a data-leakage alarm, not a curiosity.</p>
    <h2>Takeaways</h2>
    <p>Ship explanations alongside predictions, validate that the model attends to clinically plausible regions, and use disagreements between the map and domain experts as a debugging signal. Interpretability is cheapest when you build it in from the start.</p>`,

  "vit-intuition": `
    <p>Vision Transformers feel like magic until you realise they're doing something almost embarrassingly simple: chop an image into patches, treat each patch like a word, and run a standard Transformer. The magic is in the consequences, not the mechanism.</p>
    <h2>Patches as tokens</h2>
    <p>A 224×224 image split into 16×16 patches becomes a sequence of 196 tokens. Each patch is flattened and linearly projected into an embedding, a learnable position embedding is added, and a special classification token is prepended. From here, it's attention all the way down.</p>
    <h2>Why attention helps vision</h2>
    <p>Convolutions bake in locality — a pixel only sees its neighbourhood until you stack many layers. Self-attention lets every patch talk to every other patch in layer one. That global receptive field is why ViTs shine on tasks where long-range context matters.</p>
    <h2>The data appetite</h2>
    <p>The flip side: ViTs lack the inductive biases CNNs get for free, so they need either large datasets or strong augmentation and regularisation to compete. On small medical datasets I almost always start from pretrained weights and fine-tune.</p>
    <h2>When I reach for a ViT</h2>
    <p>If I have transfer-learning weights and global context matters, a ViT (or a hybrid CNN-ViT) is my default. If data is tiny and local texture dominates, a well-regularised CNN is still hard to beat. Knowing which bias you want is most of the decision.</p>`,

  "bert-gpt2": `
    <p>My thesis asked an awkward question: how do you build a decent conversational model for Bangla when there's almost no clean dialogue data? The answer I landed on was a hybrid — let an encoder understand and a decoder generate.</p>
    <h2>Why hybridise at all</h2>
    <p>BERT is a bidirectional encoder: brilliant at understanding intent, useless at generating fluent replies. GPT-2 is an autoregressive decoder: fluent, but with a shallower grasp of nuanced intent. Bolting them together captures the strengths of each.</p>
    <h2>The architecture</h2>
    <p>BERT encodes the user turn into a context representation; that representation conditions GPT-2's generation. The interface between them is the fiddly part — aligning tokenizers and projecting between hidden spaces took more iterations than the modelling itself.</p>
    <h2>Low-resource tricks</h2>
    <p>Back-translation, careful transliteration handling, and aggressive deduplication did more for quality than any architecture tweak. In low-resource NLP, data work is the model work.</p>
    <h2>What I'd do differently</h2>
    <p>Today I'd benchmark a single multilingual decoder-only model first — the field moved fast. But the encoder-conditions-decoder pattern remains a clean way to reason about understanding versus generation.</p>`,

  forecasting: `
    <p>Three teams, three forecasts, three completely different philosophies — and all three can be right depending on the series. Here's how I choose between ARIMA, Prophet, and an LSTM on the same retail demand data.</p>
    <h2>ARIMA: the statistician's scalpel</h2>
    <p>When the series is stationary (or can be made so) and you want interpretable coefficients and confidence intervals, ARIMA is hard to beat. It struggles with multiple seasonalities and needs careful differencing, but for a single clean signal it's fast and honest.</p>
    <h2>Prophet: the pragmatist's default</h2>
    <p>Prophet decomposes trend, seasonality, and holidays additively. It's forgiving of missing data, handles multiple seasonalities, and a non-specialist can tune it. The cost is flexibility — it assumes a structure that not every series follows.</p>
    <h2>LSTM: the heavy machinery</h2>
    <p>When you have lots of history, exogenous features, and non-linear dynamics, an LSTM (or a temporal CNN/Transformer) can capture patterns the others can't. It also overfits eagerly, resists interpretation, and demands the most engineering.</p>
    <h2>A field guide</h2>
    <p>Start simple. If ARIMA or Prophet gets you within tolerance, ship it. Reach for deep learning when the error genuinely won't budge and the business value justifies the operational weight.</p>`,

  mlops: `
    <p>The model that identifies cattle from muzzle prints worked beautifully in a Colab notebook. Getting it to serve a thousand requests a day reliably was a different project entirely — and the more valuable one.</p>
    <h2>From notebook to artifact</h2>
    <p>The first step was making the model reproducible: pinned dependencies, a versioned weights file, and a single <code>predict()</code> entry point with no notebook state. If you can't rebuild it from a clean checkout, you don't have a deployable model.</p>
    <h2>Wrapping it in an API</h2>
    <p>A thin FastAPI service handled validation, batching, and error handling around the model. Keeping pre/post-processing server-side meant clients sent raw images and got clean JSON — no chance of a client and the model disagreeing on normalisation.</p>
    <h2>Running it on AWS</h2>
    <p>An EC2 instance with the model behind a process manager, health checks, and structured logging covered the basics. Autoscaling came later, once traffic justified it — premature scaling is just premature cost.</p>
    <h2>The unglamorous wins</h2>
    <p>Monitoring latency, logging every prediction for later audit, and a one-command rollback saved me more grief than any accuracy gain. Production ML is 20% model, 80% the scaffolding around it.</p>`,

  reflections: `
    <p>Three years in a research lab taught me more about people and process than about any particular architecture. A few lessons I wish I'd learned sooner.</p>
    <h2>Papers are arguments, not reports</h2>
    <p>A good paper persuades. The experiments exist to support a claim, and the writing has to make that claim legible to a tired reviewer at midnight. Learning to lead with the argument changed how my work landed.</p>
    <h2>Deadlines compress, they don't create</h2>
    <p>The week before a conference deadline produces polish, not insight. The insight has to exist months earlier. I stopped treating deadlines as motivation and started treating them as a packaging step.</p>
    <h2>Mentoring is a force multiplier</h2>
    <p>Teaching students forced me to articulate things I only half-understood. Half my own clarity came from explaining ideas to someone newer than me.</p>
    <h2>Ship research that survives review</h2>
    <p>Reproducibility, honest baselines, and ablations aren't bureaucracy — they're what separates a result from a coincidence. Build the rigor in and peer review becomes a formality rather than a threat.</p>`,
};

// Attach bodies onto the live BLOGS entries (so blog-post.html can read post.body).
if (typeof BLOGS !== "undefined") {
  BLOGS.forEach((b) => { if (BLOG_CONTENT[b.id]) b.body = BLOG_CONTENT[b.id]; });
}
