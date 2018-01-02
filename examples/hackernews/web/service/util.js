import moment from 'moment';

export const relativeTime = time => moment(new Date(time * 1000)).fromNow();
export const domain = url => url && url.split('/')[2];
