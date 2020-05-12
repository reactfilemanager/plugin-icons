import TxIcons from './TxIcons';

let _EventBus = null;

export const getEventBus = () => _EventBus;

export default {
  tabs: {
    txIcons: {
      title: 'Icons',
      component: TxIcons,
    },
  },
  boot({EventBus}) {
    _EventBus = EventBus;
  },
};
