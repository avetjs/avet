/* global window, document, __AVET_DATA__ */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Document from '../server/document';
import dynamic from './dynamic';
import Error from './error';
import Head from './head';
import Link from './link';
import Router from './router';
import UniversalRouter from './router/universal-router';
import axios from 'axios';

const routerInstance = UniversalRouter({ Link, Router });

export default {
  request: axios,
  universalRouter: routerInstance,
  dynamic,
  Document,
  Error,
  Head,
  Link: routerInstance.Link,
  Router: routerInstance.Router,
  React,
  PropTypes,
};
