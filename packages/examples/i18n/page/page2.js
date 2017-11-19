import React from 'react';
import translate from 'avet/i18n';

import PureComponent from '../components/PureComponent';
import ExtendedComponent from '../components/ExtendedComponent';

function Page2({ t }) {
  return (
    <div>
      {t('welcomePage2')}
      <p>{t('common:integrates_i18n')}</p>
      <PureComponent t={t} />
      <ExtendedComponent />
      <a href="/"><a>{t('link.gotoPage1')}</a></a>
    </div>
  )
}

export default translate(Page2, ['common', 'page2']);
