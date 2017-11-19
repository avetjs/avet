import initAvet, * as avet from './';

window.avet = avet;

initAvet().catch(err => {
  console.error(`${err.message}\n${err.stack}`);
});
