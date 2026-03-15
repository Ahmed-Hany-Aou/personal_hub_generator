# Elite Studio Architecture (BMAD Managed)

## Design Principles
1. **Stateless Preview Engine**: The backend (`/api/preview`) is stateless, allowing for rapid real-time updates in the studio without session bloat.
2. **Template Modularization**: Design templates are stored as pure JSON in `templates/gallery/`. This allows for easy extension and A/B testing of design presets.
3. **Identity Preservation**: The template application logic uses a "Placeholders" approach (`{{fullName}}`, `{{jobTitle}}`) to ensure user identity is automatically injected into new designs upon selection.
4. **Interactive Card Canvas**: Business card design is handled via Fabric.js on the client-side for interactivity, but serialized to a production-hardened layer format for Jimp composite on the server.

## BMAD Framework Integration
- **Persona**: `bmad-dev` leads technical implementation.
- **Tasks**: Tracked in `_bmad/tasks/`.
- **Docs**: Decision logs and architectural overviews maintained in `_bmad/docs/`.
