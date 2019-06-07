import React from 'react';
import ReactDom from 'react-dom';
import FormSelector from './components/FormSelector';

const CustomElement = (window as any).CustomElement;

CustomElement.init((element: any, _context: any) => {
    const selectedForm = element.value ? JSON.parse(element.value) : null;
    const config = element.config || {};

    const components = (
        <FormSelector
            portalId={config.portalId}
            selectedForm={selectedForm}
            disabled={element.disabled}
            customElementApi={CustomElement}
        />
    );

    ReactDom.render(components, document.querySelector('#reactapp'));
});
