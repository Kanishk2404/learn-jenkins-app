import { Component, h, Prop, State, Watch } from '@stencil/core';
import { ComponentIds } from '../../component-ids';
import Services from '../../../services/services';
import { I18N, TranslationMethod } from '../../../utils/i18n';
import { factsetSearchMessages } from './configuration/messages';
import { VocabularyObject } from '../../../utils/i18n/interfaces';
import { NotifiesFwWhenReady } from '../../../utils/framework/interfaces';
import { WidgetSizes } from '../dashboard-widget/helpers';
import { SearchWidgetConfiguration } from './interfaces';
import { searchConfiguration } from './configuration/config';
import { initializeDatadog } from '../../common/ws-components/datadog-init';
import { HttpMethod } from '../../../services/api/interfaces';

@Component({
  tag: 'br-plutux-factset-search-widget',
  styleUrl: 'factset-search-widget.scss',
  shadow: false,
})
export class FactSetSearchWidget implements NotifiesFwWhenReady {
  @Prop() selectedView: string;
  @Prop() onComponentLoaded: () => void = () => {};
  @Prop({ attribute: 'context' }) _context = '';
  @Prop() onInit!: Record<string, string>;
  @Prop({ attribute: 'activeLanguage' }) activeLanguage = 'en-US';
  @Prop() locale = 'en-US';
  @Prop({ attribute: 'selectedView' }) size? = WidgetSizes.MEDIUM;
  @Prop({ attribute: 'defaultConfig' }) defaultConfig = {};

  vocabulary: VocabularyObject = {};
  translations: VocabularyObject = factsetSearchMessages;
  configurationData: SearchWidgetConfiguration = searchConfiguration;
  pg: I18N;
  translationMethod: TranslationMethod;

  @State() myApiData: any = null;
  @State() myApiError: string = '';
  @State() searchValue: string = '';

  componentWillLoad() {
    initializeDatadog();
    Services.init(this, ComponentIds.FACTSET_SEARCH_WIDGET);
    this.translationMethod = this.pg.t.bind(this);
    this.onComponentLoaded();
    this.loadData();
  }

  getEffectiveConfiguration(): SearchWidgetConfiguration {
    return {
      ...this.configurationData,
      searchUrl:
        this.defaultConfig?.['searchUrl'] !== undefined
          ? this.defaultConfig['searchUrl']
          : this.configurationData.searchUrl,
    };
  }

  @Watch('activeLanguage')
  handleServicesRelatedPropChanges(newValue: unknown, oldValue: unknown, propName: string): void {
    Services.notifyAboutPropChange(
      newValue,
      oldValue,
      propName,
      ComponentIds.FACTSET_SEARCH_WIDGET
    );
  }

  loadData() {
    Services.api(ComponentIds.CONTENT_RECOMMENDATIONS_WIDGET)
      .fetch<any>(
        {
          name: 'recommendedContent',
          method: HttpMethod.GET,
        },
        {
          autoAbort: false,
        }
      )
      .then((res) => {
        this.myApiData = res;
      })
      .catch((error) => {
        this.myApiError = 'Failed to load data';
      });
  }

  handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.searchValue = target.value;
  };

  handleSubmit = (event: Event) => {
    event.preventDefault();
    // You can add search logic here if needed
    this.loadData();
  };

  handleReset = () => {
    this.searchValue = '';
    this.myApiData = null;
    this.myApiError = '';
  };

  render() {
    return (
      <div class="factset-search-widget-container">
        <form class="factset-search-form" onSubmit={this.handleSubmit} onReset={this.handleReset}>
          <input
            class="factset-search-input"
            type="text"
            placeholder="Search..."
            value={this.searchValue}
            onInput={this.handleInput}
          />
          <div class="factset-search-buttons">
            <brml-button type="submit">Submit Button</brml-button>
            <brml-button type="button">Button Button</brml-button>
            <brml-button type="reset">Reset Button</brml-button>
          </div>
        </form>
        <div class="factset-search-result-area">
          {this.myApiError && <div class="error">{this.myApiError}</div>}
          {this.myApiData ? (
            <pre class="factset-search-data">{JSON.stringify(this.myApiData, null, 2)}</pre>
          ) : (
            !this.myApiError && <div class="loading">Loading...</div>
          )}
        </div>
        <br-plutux-iframe
          selectedView={this.selectedView}
          iframeSrc={this.getEffectiveConfiguration().searchUrl}
          iframeId={'factset-search'}
          iframeTitle={this.pg.t('header.iframeTitle')}
          heading={this.pg.t('header.factsetSearchHeading')}
          iframeClass={'search'}
        />
      </div>
    );
  }
} 