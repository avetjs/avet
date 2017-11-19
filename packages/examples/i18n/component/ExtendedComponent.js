import React from 'react';
import translate from 'avet/i18n';

function MyComponennt({ t }) {
  return (
    <div>
      {t('extendedComponent')}
    </div>
  );
}

export default translate(MyComponennt, 'common');
