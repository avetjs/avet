/* global describe, it, expect */

import { getModulePath } from '../lib/babel/plugins/handle-import';

function cleanPath(mPath) {
  return mPath.replace(/\\/g, '/').replace(/^.*:/, '');
}

describe('handle-import-babel-plugin', () => {
  it('should not do anything to NPM modules', () => {
    const mPath = getModulePath('/abc/pages/about.js', 'cool-module');
    expect(mPath).toBe('cool-module');
  });

  it('should not do anything to private NPM modules', () => {
    const mPath = getModulePath('/abc/pages/about.js', '@zeithq/cool-module');
    expect(mPath).toBe('@zeithq/cool-module');
  });

  it('should resolve local modules', () => {
    const mPath = getModulePath(
      '/abc/pages/about.js',
      '../components/hello.js'
    );
    expect(cleanPath(mPath)).toBe('/abc/components/hello');
  });

  it('should remove .js', () => {
    const mPath = getModulePath('/abc/pages/about.js', '../components/bb.js');
    expect(cleanPath(mPath)).toBe('/abc/components/bb');
  });

  it('should remove end slash', () => {
    const mPath = getModulePath('/abc/pages/about.js', '../components/bb/');
    expect(cleanPath(mPath)).toBe('/abc/components/bb');
  });
});
