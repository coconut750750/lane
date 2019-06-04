import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';

import * as auth from 'lane/backend/Auth';

import StartScreen from '../StartScreen'

jest.mock("lane/backend/Auth");

Enzyme.configure({ adapter: new Adapter() });

describe('StartScreen', () => {
    let component;
    let instance;

    beforeEach(() => {
        component = shallow(<StartScreen />);
        instance = component.instance();
    });

    it('renders start screen', () => {
        const screen = renderer.create(instance.render()).toJSON();
        expect(screen).toMatchSnapshot();
    });

    it('did start start auth listener', () => {
        expect(auth.checkIfLoggedIn).toHaveBeenCalled();
    });
});