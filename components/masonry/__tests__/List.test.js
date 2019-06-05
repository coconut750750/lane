import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
var _ = require('lodash');

import MasonryList from '../List'

Enzyme.configure({ adapter: new Adapter() });

describe('List', () => {
    let dimens1row = [{uri: 'uri', height: 100, width: 100}, {uri: 'uri', height: 100, width: 100}, {uri: 'uri', height: 100, width: 100}]
    let dimens2row = [{uri: 'uri', height: 100, width: 360}, {uri: 'uri', height: 100, width: 360}, {uri: 'uri', height: 100, width: 100}]

    let data = [{ 
        "data": [{
            uri: 'uri',
            height: 100,
            width: 360,
        }],
        "height": 100,
    }, {
        "data": [{
            uri: 'uri',
            height: 150,
            width: 120,
        }, {
            uri: 'uri',
            height: 150,
            width: 120,
        }, {
            uri: 'uri',
            height: 150,
            width: 120,
        }],
        "height": 150,
        
    }, {
        "data": [{
            uri: 'uri',
            height: 50,
            width: 180,
          }, {
            uri: 'uri',
            height: 50,
            width: 180,
        }],
        "height": 50,
    }];

    it('simple generate row counts', () => {
        const component = shallow(
            <MasonryList photos={dimens1row} width={0} itemPadding={2} style={{ flex: 1 }} />
        );
        const instance = component.instance();
        let rowCounts = instance.generateRowCounts(dimens1row);
        expect(rowCounts.length).toBe(1);
    });

    it('three row counts', () => {
        const component = shallow(
            <MasonryList photos={dimens2row} width={0} itemPadding={2} style={{ flex: 1 }} />
        );
        const instance = component.instance();
        let rowCounts = instance.generateRowCounts(dimens2row);
        expect(rowCounts.length).toBe(2);
    });

    it('simple get item layout', () => {
        const component = shallow(
            <MasonryList photos={dimens1row} width={0} itemPadding={2} style={{ flex: 1 }} />
        );
        const instance = component.instance();
        var dataCopy = _.cloneDeep(data);
        let layout = instance.getItemLayout(dataCopy, 0);
        expect(layout).toEqual({length: 100, offset: 0, index: 0});

        expect(dataCopy.map(i => i.offset)).toEqual([0, 100, 250]);
    });
});