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

    const setupLoggedIn = () => {
        auth.checkIfLoggedIn.mockImplementation( (callback) => callback(true) );
        return setup();
    }

    const setupLoggedOut = () => {
        auth.checkIfLoggedIn.mockImplementation( (callback) => callback(false) );
        return setup();
    }

    it('renders start screen', () => {
        const { component, instance } = setupLoggedIn();

        const screen = renderer.create(instance.render()).toJSON();
        expect(screen).toMatchSnapshot();
    });

    it('did start start auth listener', () => {
        const { component, instance } = setupLoggedIn();
        expect(auth.checkIfLoggedIn).toHaveBeenCalled();
    });

    it('did navigate to home when check login was true', () => {
        const { component, instance } = setupLoggedIn();
        expect(mockNavigate).toHaveBeenCalledWith('Home');
    });

    it('did not navigate to home when check login was false', () => {
        const { component, instance } = setupLoggedOut();
        expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
});