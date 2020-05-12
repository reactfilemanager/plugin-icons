import React, {Component} from 'react';
import debounce from 'debounce';

const QUIX_URL = window.quix ? quix.url : '//try.getquix.net';
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
    };
  }

  componentDidMount = () => {
    this.setState({loading: true});
    this.loadIcons();
    this.loadFromServer();
  };

  loadIcons = () => {
    const cached = window.localStorage.getItem('icons');
    const icons = cached ? JSON.parse(cached) : [];
    this.setState({icons});
  };

  loadFromServer = () => {
    fetch(`${QUIX_URL}/index.php?option=com_quix&task=api.getIcons&${JFORM_TOKEN}=1`,
      {credentials: 'same-origin'})
      .then(data => data.json())
      .then(icons => {
        if (icons.success == false) {
          icons = [];
          this.setState({error: true});
        }

        this.setState({loading: false});
        const jsonStr = JSON.stringify(icons);

        this.setState({icons});
        window.localStorage.setItem('icons', jsonStr);
      })
      .catch(err => {
        console.log(err);
        alert('Failed to load icons');
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
    const icons = this.state.icons.filter(icon => {
      return this.fuzzySearch(this.state.query, icon.name);
    });

    if (this.state.loadAll) {
      return icons;
    }
    return icons.slice(0, 35);
  }

  loadAll = e => {
    this.setState({loadAll: true});
  };

  selectSVG = svg => {
    console.log(svg);
  };

  render() {
    const icons = this.icons;

    if (this.state.error && icons.length === 0) {
      return <h2 className="text-center"> Something Wrong. Please talk with QUIX developer </h2>;
    }

    return (
      <div /*prefixCls="qxui-spin" spinning={this.state.loading}*/>
        <div className="fm-toolbar">
          <input defaultValue={this.state.query} onChange={this.handleQuery} placeholder="Search icons for..." />
        </div>

        <div id="fm-content-holder">
          <div id="fm-content">
            <div className="qx-row">
              {icons.map((icon, i) => {
                return (
                  <div key={`icon-${i}`} className="fm-grid-m" onDoubleClick={() => this.selectSVG(icon.className)}>
                    <div className="fm-media">
                      <div className="fm-media__thumb">
                        <i className={icon.className} />
                      </div>
                      <div className="fm-media__caption"><span>{icon.label}</span></div>
                    </div>
                  </div>);
              })}
            </div>
            {this.state.loadAll ? null : <div className="qx-text-center qx-d-block qx-m-2">
              <button className="qxui-btn qxui-btn-primary" onClick={this.loadAll}>Load All</button>
            </div>}
          </div>
        </div>
      </div>
    );
  }
}

export default TxIcons;
