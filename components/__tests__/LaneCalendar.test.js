import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import LaneCalendar from '../LaneCalendar'

Enzyme.configure({ adapter: new Adapter() });

describe('LaneCalendar', () => {
    let markings = {
        '2019-05-16': {
            periods: [
                { startingDay: true, endingDay: false, color: '#5f9ea0' },
                { startingDay: true, endingDay: false, color: '#ffa500' },
            ]
        }, '2019-05-17': {
            periods: [
                { startingDay: false, endingDay: true, color: '#5f9ea0' },
                { startingDay: false, endingDay: true, color: '#ffa500' },
            ]
        }
    };

    it('render without markings', () => {
        const component = shallow(<LaneCalendar markings={{}}/>);
        expect(component).toMatchSnapshot();
    });

    it('render with markings', () => {
        const component = shallow(<LaneCalendar markings={markings}/>);
        expect(component).toMatchSnapshot();
    });

    it('selected date is highlighted', () => {
        const onDayPress = jest.fn( date => {} );
        const component = shallow(<LaneCalendar markings={{}} onDayPress={onDayPress}/>);
        const instance = component.instance();
        instance.onDayPress({dateString: '2019-05-20'});
        expect(instance.state.selected).toEqual('2019-05-20');
    });
});