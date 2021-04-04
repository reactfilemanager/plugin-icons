import React, {Component} from 'react';
import debounce from 'debounce';
import {getEventBus} from './index';
import {Button} from 'theme-ui';

const QUIX_URL = window.quix ? quix.url : '//getquix.net';
const jform_token = document.getElementById('jform_token');
const JFORM_TOKEN = jform_token ? jform_token.name : null;

class TxIcons extends Component {

  constructor(props) {
    super(props);
    this.state = {
      icons: [],
      query: '',
      loadAll: false,
      loading: false,
      error: false,
      selected: null,
    };
  }

  componentDidMount = () => {
    this.setState({loading: true});
    this.loadIcons();
    // this.loadFromServer();
  };

  loadIcons = () => {
    const cached = window.localStorage.getItem('jmedia-icons');
    // const icons = cached ? JSON.parse(cached) : [];
    var icons = [];
    if (cached) {
      icons = JSON.parse(cached);
    }
    else {
      this.loadFromServer();
    }

    this.setState({icons});
  };

  loadFromServer = () => {

    var iconUrl = '';
    if (window.quix) {
      /**
       * never gonnal call as inside iframe
       * previous iconUrl = `https://getquix.net/index.php?option=com_quixblocks&view=flaticons&format=json`;
       * @type {string}
       */
      iconUrl = `${QUIX_URL}/index.php?option=com_quix&task=api.getIcons&${JFORM_TOKEN}=1`;
    }
    else {

      // iconUrl = `${COM_JMEDIA_BASEURL}index.php?option=com_jmedia&task=api.fontJSON&asset=com_quix&author=${COM_JMEDIA_AUTHOR}&format=json`;
      iconUrl = `${COM_JMEDIA_BASEURL}media/com_jmedia/json/qx-fonts.json`;
    }

    fetch(iconUrl,
        {
          credentials: 'same-origin',
          cache: 'force-cache',
          mode: 'no-cors',
        },
    )
        .then(data => data.json())
        .then(icons => {
          if (icons.success == false) {
            icons = [];
            this.setState({error: true});
          }

          this.setState({loading: false, error: false});
          const jsonStr = JSON.stringify(icons);

          this.setState({icons});

          if (icons) {
            window.localStorage.setItem('jmedia-icons', jsonStr);
          }
        })
        .catch(err => {
          console.log(err);
          // alert('Failed to load icons');
          this.setState({loading: false});
        });
  };

  hashCode = string => {
    let hash = 0;
    if (string.length === 0) {
      return hash;
    }
    for (let i = 0; i < string.length; i++) {
      let char = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  };

  handleQuery = e => {
    this.setQuery(e.target.value);
  };
  setQuery = debounce(query => {
    this.setState({query});
  }, 100);

  fuzzySearch = (needle, haystack) => {
    const hlen = haystack.length;
    const nlen = needle.length;
    if (nlen > hlen) {
      return false;
    }
    if (nlen === hlen) {
      return needle === haystack;
    }
    outer: for (let i = 0, j = 0; i < nlen; i++) {
      const nch = needle.charCodeAt(i);
      while (j < hlen) {
        if (haystack.charCodeAt(j++) === nch) {
          continue outer;
        }
      }
      return false;
    }
    return true;
  };

  get icons() {

    let icons = this.state.icons.filter(icon => {
      return this.fuzzySearch(this.state.query, icon.name);
    });

    let filter = this.state.filter;
    if (filter) {
      icons = icons.filter(item => item.group === filter);

      console.log(icons);
    }

    if (this.state.loadAll) {
      return icons;
    }
    return icons.slice(0, 35);
  }

  loadAll = e => {
    this.setState({loadAll: true});
  };

  selectSVG = svg => {
    const svgIcon = this.icons.find(i => i.class === svg);
    const file = {};
    file.name = svgIcon.label;
    file.svg = svg;
    file.type = 'svg';

    getEventBus().$emit('SELECT_FILE', file);
  };

  render() {
    const icons = this.icons;
    let iconGroups = new Array(...new Set(this.state.icons.map(icon => icon.group)));

    if (this.state.error && icons.length === 0) {
      return <h2 className="text-center"> Something Wrong. Please talk with QUIX developer </h2>;
    }

    return (
        // /*prefixCls="qxui-spin" spinning={this.state.loading}*
        <div className="jmedia-plugin-icons">
          <header className="fm-toolbar qx-flex qx-flex-beetween" style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <input defaultValue={this.state.query} onChange={this.handleQuery} placeholder="Search icons for..." />
            <div className="qx-flex qx-flex-right qx-width" style={{
              display: 'flex',
            }}>
              {/*group*/}
              <Button variant={this.state.filter === '' ? 'primary' : 'secondary'} className="qxui-button"
                      onClick={() => this.setState({'filter': ''})}>All</Button>

              {
                iconGroups.map(item, index => {
                  return <Button key={index} variant={this.state.filter === item ? 'primary' : 'secondary'} className="qxui-button"
                                 onClick={() => this.setState({'filter': item})}>{item}</Button>
                })
              }

            </div>
          </header>

          <div id="fm-content-holder" style={{
            marginTop: '15px',
          }}>
            <div id="fm-content">
              <div className="qx-row">
                {icons.map((icon, i) => {
                  return (
                      <div key={`icon-${i}`} className={'fm-grid-m' + (this.state.selected == `icon-${i}` ? ' active' : '')}
                           onDoubleClick={() => this.selectSVG(icon.class)}
                           onClick={(e) => this.setState({selected: `icon-${i}`})}
                      >
                        <div className="fm-media">
                          <div className="fm-media__thumb">
                            <i className={icon.className} />
                          </div>
                          <div className="fm-media__caption"><span>{icon.label}</span></div>
                        </div>
                      </div>);
                })}
              </div>
            </div>
            <div className="fm-footer">
              <p style={{textAlign: 'center'}}>
                {this.state.loadAll ? null :
                    <button className="qxui-btn qxui-btn-primary" onClick={this.loadAll}>Load All</button>
                }
              </p>
            </div>

          </div>
        </div>
    );
  }
}

export default TxIcons;
