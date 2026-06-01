/* =========================================================================
   blog-content.js — full article bodies (HTML), attached onto BLOGS by id.
   Edit articles here, or via the admin dashboard (which stores overrides
   in localStorage). Loaded after data.js, before store.js.
   ========================================================================= */

const BLOG_BODIES = {
  gradcam: `
<p>When a model tells a radiologist "this scan shows a tumor," the natural next question is <em>why</em>. A bare probability is not enough to earn clinical trust. This is the gap explainability methods close — and <strong>Grad-CAM</strong> is the one I reach for first.</p>
<h2 id="what">What Grad-CAM actually does</h2>
<p>Gradient-weighted Class Activation Mapping produces a heatmap over the input image, highlighting the regions that pushed the network toward its prediction. It works by flowing the gradient of the target class back into the last convolutional layer, then weighting each feature map by how much it contributed. The result is a coarse localisation map you can overlay on the original scan.</p>
<p>Crucially, it requires <em>no architectural changes and no retraining</em>. You attach it to a trained model and read out its attention.</p>
<h2 id="hybrid">Why it pairs well with a MobileNet-ViT hybrid</h2>
<p>In our brain-tumor work we used a MobileNet feature extractor fused with a Vision Transformer head. The convolutional stem gives Grad-CAM a clean spatial feature map to target, while the transformer head handles global reasoning. Hooking Grad-CAM onto the final conv block of the MobileNet stem gave us heatmaps that lined up convincingly with the tumor regions clinicians pointed to.</p>
<blockquote>An explanation does not have to be perfect to be useful. It has to be faithful enough that a domain expert can sanity-check the model's reasoning.</blockquote>
<h2 id="wiring">Wiring it up in practice</h2>
<p>The recipe is short:</p>
<ul>
<li>Register a forward hook on the target conv layer to capture activations.</li>
<li>Register a backward hook to capture gradients for the predicted class.</li>
<li>Global-average-pool the gradients to get per-channel weights.</li>
<li>Weight the activations, ReLU, upsample to the input size, and overlay.</li>
</ul>
<p>Libraries like <code>pytorch-grad-cam</code> wrap all of this, but writing it once by hand is worth it — you will understand exactly which layer you are explaining.</p>
<h2 id="pitfalls">Pitfalls I learned the hard way</h2>
<p>Grad-CAM is low-resolution by nature; do not oversell pixel-perfect localisation. It is also class-specific — always generate the map for the predicted class, not a fixed one. And a confident-but-wrong heatmap is a gift: it tells you the model latched onto a spurious cue (a scanner artifact, a text label) rather than anatomy.</p>
<h2 id="takeaway">The takeaway</h2>
<p>Explainability is not a nice-to-have bolted on at the end. In medical AI it is part of the contract. Grad-CAM is the cheapest credible step you can take toward that contract — start there, then graduate to SHAP or attention rollout when you need finer attribution.</p>`,

  "vit-intuition": `
<p>Vision Transformers can feel like a magic trick: take an architecture built for language, feed it image patches, and somehow it rivals CNNs. Here is the intuition, with the math kept gentle.</p>
<h2 id="patches">Images as sequences</h2>
<p>A ViT chops the image into fixed-size patches — say 16×16 pixels — flattens each into a vector, and treats the result as a <em>sequence of tokens</em>, exactly like words in a sentence. A learned linear projection embeds each patch, and a positional embedding tells the model where each patch sat in the grid.</p>
<h2 id="attention">Attention, briefly</h2>
<p>Self-attention lets every patch look at every other patch and decide how much to care. Each token emits a query, a key, and a value; the dot product of queries and keys produces attention weights, and the output is a weighted sum of values. The payoff: a patch in the top-left corner can directly attend to one in the bottom-right in a single layer — something a CNN only achieves after stacking many.</p>
<blockquote>CNNs build understanding locally and grow their receptive field slowly. Transformers are global from layer one. That is the whole story in a sentence.</blockquote>
<h2 id="data">The catch: data hunger</h2>
<p>That global flexibility comes at a price. CNNs bake in priors — locality, translation equivariance — that ViTs must <em>learn</em> from data. On small datasets a ViT trained from scratch will lose to a ResNet. The fix is one of two things: pre-train on a huge corpus, or borrow those priors with a convolutional stem.</p>
<h2 id="hybrid">Why hybrids win in the wild</h2>
<p>For most applied problems — medical imaging especially, where data is scarce — a hybrid is the pragmatic answer. A lightweight CNN extracts local features cheaply and injects the inductive bias ViTs lack; the transformer layers then reason globally over those features. This is exactly the design we used for tumor classification, and it consistently beat both a pure CNN and a pure ViT on our dataset sizes.</p>
<h2 id="when">When to reach for a ViT</h2>
<p>Reach for transformers when you have scale (data or a strong pre-trained checkpoint), when global context matters, or when you want a unified architecture across modalities. Stick with CNNs — or go hybrid — when data is limited and latency is tight.</p>`,

  "bert-gpt2": `
<p>My undergraduate thesis asked a stubborn question: how do you build a decent conversational model for a language with a fraction of the resources English enjoys? Bangla has over 230 million speakers and a fraction of the clean, labelled dialogue data. Our answer was a hybrid that fused understanding and generation.</p>
<h2 id="split">Two halves of a conversation</h2>
<p>A good chatbot does two jobs: it must <em>understand</em> what was said, and <em>generate</em> a coherent reply. BERT is an encoder — superb at understanding, useless at open-ended generation. GPT-2 is a decoder — built to generate, weaker at deep bidirectional understanding. Our idea was to let each do what it is good at.</p>
<h2 id="arch">The hybrid architecture</h2>
<p>BERT encoded the incoming message into a rich contextual representation. That representation conditioned a GPT-2 decoder, which generated the response token by token. The encoder gave us grounding; the decoder gave us fluency.</p>
<blockquote>Low-resource NLP is less about inventing new layers and more about composing existing strengths so you need less data to get a usable result.</blockquote>
<h2 id="data">Fighting the data problem</h2>
<p>Three things mattered more than architecture. First, aggressive normalisation of Bangla script — Unicode in Bangla is messy, with multiple encodings for visually identical text. Second, leaning on multilingual pre-trained weights so we were fine-tuning, not training from zero. Third, careful evaluation: BLEU alone is misleading for dialogue, so we paired it with human judgement of coherence.</p>
<h2 id="lessons">What I would do differently</h2>
<p>Today I would start from a modern multilingual LLM and fine-tune with LoRA rather than hand-fusing two models. But the lesson holds: when data is the bottleneck, architecture choices should be in service of <em>sample efficiency</em>. The fanciest model is worthless if you cannot feed it.</p>
<h2 id="why">Why low-resource work matters</h2>
<p>Most of the world's languages are "low-resource." Building for them is not a niche exercise — it is how AI becomes equitable. That conviction is what carried this project from a thesis into the direction I still care about.</p>`,

  forecasting: `
<p>"Which forecasting model should I use?" is the wrong question. The right one is "what does my series look like, and what do I need from the forecast?" Here is how three popular approaches compared on the same retail sales series.</p>
<h2 id="arima">ARIMA: the statistical workhorse</h2>
<p>ARIMA models the series as a function of its own past values and past errors. It is interpretable, fast, and demands very little data. But it assumes (after differencing) a roughly stationary, linear process, and it handles multiple seasonalities poorly. For a clean series with one dominant trend and seasonality, ARIMA is hard to beat on effort-to-value.</p>
<h2 id="prophet">Prophet: seasonality made easy</h2>
<p>Facebook's Prophet decomposes a series into trend, seasonality, and holiday effects. Its superpower is convenience: it tolerates missing data, shrugs off outliers, and lets a non-specialist add domain knowledge like holiday calendars. On our retail data it captured weekly and yearly seasonality with almost no tuning. The trade-off is that it is a curve-fitting model, not a true generative process — it can look confident while missing regime changes.</p>
<blockquote>Prophet is the model you give a stakeholder who needs a believable forecast by Friday. ARIMA is the one you give a statistician who wants to argue about assumptions.</blockquote>
<h2 id="lstm">LSTM: power that demands data</h2>
<p>An LSTM learns nonlinear temporal dependencies directly. Given enough history and features, it can model interactions neither ARIMA nor Prophet can. But it is data-hungry, slower to train, harder to interpret, and easy to overfit. On our single series it did <em>not</em> clearly win — there simply was not enough data to justify the capacity.</p>
<h2 id="verdict">A field guide</h2>
<ul>
<li><strong>Short, clean, one seasonality?</strong> ARIMA.</li>
<li><strong>Need fast, robust, business-friendly results?</strong> Prophet.</li>
<li><strong>Long histories, many related series, nonlinear effects?</strong> LSTM (or modern transformers).</li>
</ul>
<p>The meta-lesson: match model complexity to data volume. Reaching for deep learning on a few hundred points is how you lose to a five-line statistical baseline.</p>`,

  mlops: `
<p>A model that lives in a notebook helps no one. The distance between "it works in Colab" and "it serves a thousand requests a day" is where most ML value is won or lost. Here is how one cattle-identification model made that journey.</p>
<h2 id="start">Where it started</h2>
<p>The model recognised individual cattle from their muzzle prints — unique, like fingerprints. In a notebook it was a feature-extraction pipeline plus a similarity match. Accurate, but completely unusable by the farm software that needed it.</p>
<h2 id="api">Step one: an honest API</h2>
<p>We wrapped inference in a REST API. The endpoint took an image, returned a match and a confidence. The discipline this forced was healthy: clear input validation, defined error responses, and a hard latency budget. A model behind an API has to commit to a contract.</p>
<blockquote>The moment your model has an API, it stops being a research artifact and starts being a dependency other people build on. That changes how you treat it.</blockquote>
<h2 id="deploy">Step two: deployment on AWS</h2>
<p>We containerised the service and ran it on EC2. Containers gave us reproducibility — the same environment in dev and prod — and made scaling a matter of configuration rather than reinstallation. Health checks and basic autoscaling kept it responsive as request volume grew past a thousand a day.</p>
<h2 id="observe">Step three: watching it in the wild</h2>
<p>Production data is never the validation set. We logged inputs, confidences, and failures, then watched for drift — lighting conditions and camera angles on real farms differed from our training images. Monitoring is not optional; a silent model degrading in production is worse than no model.</p>
<h2 id="lessons">What "MLOps" really meant here</h2>
<p>No fancy platform — just a handful of unglamorous habits: version the model and the data, make deployment one command, log everything, and alert on the metrics that matter. Those habits, not any single tool, are what turned an experiment into a service the business could rely on.</p>`,

  reflections: `
<p>Three years in a research lab taught me more about <em>people and process</em> than about any single algorithm. Here is what stuck.</p>
<h2 id="ship">Research is shipping, slowly</h2>
<p>A paper is a product. It has a customer (reviewers, then the field), a deadline, and a quality bar. Treating submissions like ships — scoped, reviewed, polished — did more for my output than any modelling trick. The work that survives peer review is rarely the cleverest; it is the most clearly argued and rigorously validated.</p>
<h2 id="mentor">You learn it twice when you teach it</h2>
<p>Mentoring students and training hundreds of professionals forced me to articulate things I only half-understood. If you cannot explain why batch normalisation helps without hand-waving, you do not really know. Teaching is the fastest debugger for your own understanding.</p>
<blockquote>The best way to find the holes in your knowledge is to stand in front of a room and try to fill someone else's.</blockquote>
<h2 id="deadlines">Deadlines are a design tool</h2>
<p>Conference deadlines are arbitrary and absolute, and that is their gift. They force scope decisions you would otherwise avoid. I learned to ask early: what is the smallest result that is still a contribution? Then build outward from there if time allows.</p>
<h2 id="rigor">Rigour beats novelty</h2>
<p>Early on I chased novel architectures. Reviewers taught me that a careful comparison, an honest ablation, and a reproducible result are worth more than a flashy idea with shaky evidence. Science is a trust system; rigour is how you earn deposits in it.</p>
<h2 id="forward">Carrying it forward</h2>
<p>Moving from that lab to a Master's program in a new country, the technical skills travelled — but the habits travelled further. Scope ruthlessly, validate honestly, explain clearly, and respect the people learning alongside you. That is the research life, and I would choose it again.</p>`,
};

/* Attach default bodies onto the default BLOGS entries (admin/localStorage
   overrides, applied later in store.js, take precedence). */
if (typeof BLOGS !== "undefined") {
  BLOGS.forEach((b) => { if (BLOG_BODIES[b.id] && !b.body) b.body = BLOG_BODIES[b.id]; });
}
