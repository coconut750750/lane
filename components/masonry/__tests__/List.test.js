import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
var _ = require('lodash');

import MasonryList from '../List'

Enzyme.configure({ adapter: new Adapter() });

describe('List', () => {
    const test = [{uri: 'uri', height: 100, width: 100}];

    const setup = (photos) => {
        const component = shallow(
            <MasonryList photos={photos} width={0} itemPadding={2} style={{ flex: 1 }} />
        );
        const instance = component.instance();
        return { component, instance };
    }

    it('generates row counts for 3 images of same size', () => {
        const photos = [
            {uri: 'uri', height: 100, width: 100},
            {uri: 'uri', height: 100, width: 100},
            {uri: 'uri', height: 100, width: 100}
        ];
        const { component, instance } = setup([]);

        const rowCounts = instance.generateRowCounts(photos);
        expect(rowCounts.length).toBe(1);
    });

    it('generates row counts for 3 images of same aspect ratio', () => {
        const photos = [
            {uri: 'uri', height: 100, width: 100},
            {uri: 'uri', height: 150, width: 150},
            {uri: 'uri', height: 50, width: 50},
        ];
        const { component, instance } = setup([]);

        const rowCounts = instance.generateRowCounts(photos);
        expect(rowCounts.length).toBe(1);
    });

    it('generates three row counts', () => {
        const photos = [
            {uri: 'uri', height: 100, width: 360},
            {uri: 'uri', height: 100, width: 360},
            {uri: 'uri', height: 100, width: 100}
        ];
        const { component, instance } = setup([]);

        let rowCounts = instance.generateRowCounts(photos);
        expect(rowCounts.length).toBe(2);
    });

    it('simple get item layout', () => {
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
        const { component, instance } = setup(test);

        var dataCopy = _.cloneDeep(data);
        let layout = instance.getItemLayout(dataCopy, 0);
        expect(layout).toEqual({length: 100, offset: 0, index: 0});

        expect(dataCopy.map(i => i.offset)).toEqual([0, 100, 250]);
    });
});