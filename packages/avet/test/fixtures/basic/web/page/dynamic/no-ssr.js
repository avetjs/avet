import dynamic from 'avet/dynamic';

const Hello = dynamic(import('../../component/hello1'), {
  ssr: false,
  delay: 5000,
});

export default Hello;
