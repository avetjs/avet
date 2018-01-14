import dynamic from 'avet/dynamic';

const Hello = dynamic(import('../../component/hello1'), { ssr: false });

export default Hello;
