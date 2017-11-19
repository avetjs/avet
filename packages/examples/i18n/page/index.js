import React from 'react';
import translate from 'avet/i18n';

import PureComponent from '../component/PureComponent';
import ExtendedComponent from '../component/ExtendedComponent';

function Home({ t }) {
  return (
    <div>
      {t('welcome')}
      <p>{t('common:integrates_i18n')}</p>
      <PureComponent t={t} />
      <ExtendedComponent />
      <a href="/"><a>{t('link.gotoPage2')}</a></a>
    </div>
  )
}

export default translate(Home, ['home', 'common']);
