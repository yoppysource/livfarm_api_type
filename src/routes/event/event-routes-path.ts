class EventPath {
  static BASE = '/api/v1/events';
  static ID = '/:id';
  static ALL = '/';

  static withBase(eventPath: string) {
    return this.BASE + eventPath;
  }
}

export { EventPath };
