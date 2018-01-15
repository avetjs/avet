import dynamic from 'avet/dynamic';
import Welcome from '../../component/welcome';

const Welcome2 = dynamic(import('../../component/welcome'));

export default () => (
  <div>
    <Welcome name="normal" />
    <Welcome2 name="dynamic" />
  </div>
);
