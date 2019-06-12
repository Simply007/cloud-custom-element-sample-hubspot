import React from 'react';
import Select from 'react-select';
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
    signedIn: boolean;
    options: IOption[] | null;
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
            signedIn: false,
            options: null,
        };

        this.props.customElementApi.onDisabledChanged((disabled: boolean) => {
            this.setDisabled(!!disabled);
        });

        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        this.deferredUpdateSize();
        this.checkStatus();

        window.addEventListener('resize', this.updateSize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateSize);
    }

    private setDisabled = (disabled: boolean) => {
        this.setState(() => ({disabled}));
    };

    private getOptionsFromResponse = (inputValue: string, response: any): IOption[] => {
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
        } catch {
            return [];
        }
    };

    private getRootUrl = (): string => {
        const rootUrl = `${location.protocol}//${location.host}`;
        return rootUrl;
    };

    private signOut = () => {
        const request = new XMLHttpRequest();
        const url = `${this.getRootUrl()}/signout`;

        request.open('GET', url, true);

        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                this.setState(() => ({signedIn: false}));
            }
        };

        request.send();
    };

    private checkStatus = () => {
        const request = new XMLHttpRequest();
        const url = `${this.getRootUrl()}/status`;

        request.open('GET', url, true);

        request.onreadystatechange = () => {
            if (request.readyState === 4) {
                if (request.status === 401) {
                    this.setState(() => ({signedIn: false}));
                } else {
                    this.setState(() => ({signedIn: true}));
                }
            }
        };

        request.send();
    };

    private signIn = () => {
        window.open(
            `${this.getRootUrl()}/install`,
            'hubSpot_login',
            'width=900,height=500',
        );
    };

    private getOptions = (inputValue: string): Promise<IOption[]> => {
        const login = this.signIn;

        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            const url = `${this.getRootUrl()}/forms`;

            request.open('GET', url, true);
            request.setRequestHeader('content-type', 'application/json');

            request.onreadystatechange = () => {
                if (request.readyState === 4) {
                    if (request.status === 401) {
                        // Not authorized, open login
                        this.setState(() => ({signedIn: false}));
                        login();
                        reject();
                    } else {
                        this.setState(() => ({signedIn: true}));
                        const result = this.getOptionsFromResponse(inputValue, request.response);
                        resolve(result);
                    }
                }
            };

            request.send();
        });
    };

    private deferredUpdateSize = () => {
        setTimeout(this.updateSize, 10);
    };

    private updateSize = () => {
        const height = document.documentElement.offsetHeight;
        this.props.customElementApi.setHeight(height);
    };

    private onChange = (value: ValueType<IOption>) => {
        if (!this.state.disabled) {
            const typedValue = value as IOption;
            this.setState(() => ({
                selectedForm: value
            }));
            const selectedForm = typedValue && {id: typedValue.value, name: typedValue.label};
            const elementValue = (selectedForm && JSON.stringify(selectedForm)) || null;
            this.props.customElementApi.setValue(elementValue);
            this.deferredUpdateSize();
        }
    };

    private onMenuOpen = async () => {
        this.getOptions('').then((options: IOption[]) => {
            this.setState(() => ({ options }))
        })
    };

    render() {
        return (
            <div className="selector">
                <div className="selector-wrapper">
                    <Select
                        options={this.state.options || []}
                        defaultValue={this.state.selectedForm}
                        loadOptions={this.getOptions}
                        isClearable
                        isDisabled={this.state.disabled}
                        onChange={this.onChange}
                        onMenuOpen={this.onMenuOpen}
                        classNamePrefix="selector"
                    />
                </div>
                <div>
                    <img
                        alt="HubSpot"
                        className="logo"
                        src="hubspot_logo.png"
                    />
                    {!this.state.disabled &&
                    <div className="buttons">
                        {this.state.signedIn ?
                            <button onClick={this.signOut}>Sign out</button> :
                            <button onClick={this.signIn}>Sign in</button>
                        }
                    </div>
                    }
                </div>
            </div>
        );
    }
}

export default FormSelector;
