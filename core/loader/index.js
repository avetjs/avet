import Loader from './loader'

class AvetLoader extends Loader {
  loadConfig() {
    this.loadPlugin();
    super.loadConfig();
  }

  load() {
    this.loadCustomApp();
    this.loadExtend();
  }
}

export default AvetLoader;