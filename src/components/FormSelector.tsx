import React from 'react';
import AsyncSelect from 'react-select/lib/Async';
import {ValueType} from "react-select/lib/types";

interface IForm {
  id: number;
  name: string;
}

interface IOption {
  value: number;
  label: string;
}

interface IFormSelectorProps {
  selectedForm: IForm;
  disabled: boolean;
  portalId: string;
  customElementApi: any;
}

interface IFormSelectorState {
  selectedForm: ValueType<IOption>;
  disabled: boolean;
}

class FormSelector extends React.Component<IFormSelectorProps, IFormSelectorState> {
  constructor(props: IFormSelectorProps) {
    super(props);

    const selectedForm = this.props.selectedForm;
    const selected = selectedForm && {
      value: selectedForm.id,
      label: selectedForm.name,
    };

    this.state = {
      selectedForm: selected,
      disabled: this.props.disabled,
    };

    this.props.customElementApi.onDisabledChanged((disabled: boolean) => {
      this.setDisabled(!!disabled);
    });

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.deferredUpdateSize();

    window.addEventListener('resize', this.updateSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize);
  }

  setDisabled = (disabled: boolean) => {
    this.setState(() => ({ disabled }));
  };

  getOptionsFromResponse = (inputValue: string, response: any): IOption[] => {
    try {
        const forms = JSON.parse(response);

        const options = forms
            .filter((item: any) =>
                !inputValue || (item.name.toLowerCase().indexOf(inputValue) >= 0)
            )
            .map((item: any) => ({
                value: item.guid,
                label: item.name
            }));

        return options;
    }
    catch {
      return [];
    }
  };

  promiseOptions = (inputValue: string): Promise<IOption[]> => {
    return new Promise(resolve => {
      const request = new XMLHttpRequest();
      const url = `https://api.hubapi.com/forms/v2/forms?hapikey=demo`;

      request.open('GET', url, true);
      request.setRequestHeader('content-type', 'application/json');
      // request.setRequestHeader('Authorization', `Bearer ${apiToken}`);

      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          const result = this.getOptionsFromResponse(inputValue, request.response);
          resolve(result);
        }
      };

      request.send();
    });
  };

  deferredUpdateSize = () => {
    setTimeout(this.updateSize, 10);
  };

  updateSize = () => {
    const height = document.documentElement.offsetHeight;
    this.props.customElementApi.setHeight(height);
  };

  onChange = (value: ValueType<IOption>) => {
    if (!this.state.disabled) {
      const typedValue = value as IOption;
      this.setState(() => ({
        selectedForm: value
      }));
      const selectedForm = typedValue && { id: typedValue.value, name: typedValue.label };
      const elementValue = (selectedForm && JSON.stringify(selectedForm)) || null;
      this.props.customElementApi.setValue(elementValue);
      this.deferredUpdateSize();
    }
  };

  render() {
    return (
      <AsyncSelect
        defaultOptions
        defaultValue={this.state.selectedForm}
        loadOptions={this.promiseOptions}
        isDisabled={this.state.disabled}
        onChange={this.onChange}
        classNamePrefix="selector"
      />
    );
  }
}

export default FormSelector;
