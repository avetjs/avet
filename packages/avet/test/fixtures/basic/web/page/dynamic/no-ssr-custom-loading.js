import dynamic from 'avet/dynamic';

const Hello = dynamic(import('../../component/hello1'), {
  ssr: false,
  loading: () => <p>LOADING</p>,
});

export default Hello;
