# Fictional profile photography

All 64 primary photographs were individually generated with the built-in OpenAI image-generation tool for this university project. They depict fictional adults; they are not photographs of real app members. No celebrity likeness was requested. The matching database treats visual presentation independently from gender identity and selected dating preferences.

- `01.webp`–`64.webp`: one distinct primary portrait per seeded user.
- `01-2.webp`, `01-3.webp`, `02-2.webp`, `02-3.webp`, `03-2.webp`, `03-3.webp`: identity-preserving generated gallery photographs for Alice, Ben and Chris.
- `manifest.json`: primary profile ID, actual seeded name, image path, prompt, source, dimensions, byte count and SHA-256.
- `gallery-manifest.json`: corresponding metadata for gallery images.

Primary distribution: 32 feminine-presenting and 32 masculine-presenting fictional adults. Presentation is an art-direction field, not an inference about gender or orientation. Each image is individually generated, rather than cropped from a contact sheet or shared between different users. Generation prompts intentionally vary facial features, clothing and environments.

The WebP deliverables preserve original dimensions and were encoded with Sharp at quality 85. No image content was modified during encoding. Original PNG generation files were retained outside the distributable project in the task's `work/imagegen/originals` directory. The generation prompts are reproducible as instructions, but image-generation output itself is nondeterministic; the checked-in images and recorded hashes provide exact reproducibility for database seeding and demonstrations. No image-generation API access is needed to run the application.
