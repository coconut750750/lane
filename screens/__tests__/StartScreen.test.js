import React from 'react';
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';

import * as auth from 'lane/backend/Auth';

import StartScreen from '../StartScreen'

jest.mock('lane/backend/Auth', () => ({
    checkIfLoggedIn: jest.fn(),
}));

const mockNavigate = jest.fn( dest => {} );
const navigation = { navigate: mockNavigate };

Enzyme.configure({ adapter: new Adapter() });

describe('StartScreen', () => {
    const setup = () => {
        const component = shallow(<StartScreen navigation={ navigation }/>);
        const instance = component.instance();
        return { component, instance };
    }

    const setupCheckLogin = (fn) => {
        auth.checkIfLoggedIn.mockImplementation(fn);
        return setup();
    }

    const setupDefault = () => {
        return setupCheckLogin( callback => callback(true) );
    }

    it('renders start screen', () => {
        const { component, instance } = setupDefault();

        const screen = renderer.create(instance.render()).toJSON();
        expect(screen).toMatchSnapshot();
    });

    it('did start start auth listener', () => {
        const { component, instance } = setupDefault();
        expect(auth.checkIfLoggedIn).toHaveBeenCalled();
    });

    it('did navigate to home when check login was true', () => {
        const { component, instance } = setupCheckLogin( callback => callback(true) );
        expect(mockNavigate).toHaveBeenCalledWith('Home');
    });

    it('did not navigate to home when check login was false', () => {
        const { component, instance } = setupCheckLogin( callback => callback(false) );
        expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
});