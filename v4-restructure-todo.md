# Restructure for v4

- [ ] break source into core and widgets
- [ ] move specs for core into plain jasmine
- [ ] review dependencies and minimise where possible
  - [ ] underscore
  - [ ] jquery (move away from widgets for sharing code)
- [ ] include layout and model as part of core
- [ ] figure out how to publish a separate core module
  - [ ] figure out how to deal with dependencies only for core (eg convex-hull)
- [ ] remove DOMRender
- [ ] break down dom-map-view into separate files
- [ ] break down dom-map-view-spec into separate files
- [ ] remove editing widgets and move to @mindmup
  - [ ] move image drop widget and image insert controller to @mindmup
  - [ ] move dom-map-widget
  - [ ] move mapmodel editing methods
  - [ ] delete map-toolbar-widget and move to model actions in @mindmup
  - [ ] check if node-resize-widget can move to @mindmup
  - [ ] move link-edit-widget
  - [ ] check theme css widget
- [ ] review all files and break into individual function files (eg hammer-draggable)

