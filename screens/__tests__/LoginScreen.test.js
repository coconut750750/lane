import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';

import * as auth from 'lane/backend/Auth';

import LoginScreen from '../LoginScreen'

jest.mock("lane/backend/Auth");

Enzyme.configure({ adapter: new Adapter() });

describe('LoginScreen', () => {
    it('renders login screen', () => {
        const component = shallow(<LoginScreen />);
        const instance = component.instance();
        instance.state.didAttemptLogin = false;
        const screen = renderer.create(instance.render()).toJSON();
        expect(screen).toMatchSnapshot();
    });

    it('renders loading screen', () => {
        const component = shallow(<LoginScreen />);
        const instance = component.instance();
        instance.state.didAttemptLogin = true;
        const screen = renderer.create(instance.render()).toJSON();
        expect(screen).toMatchSnapshot();
    });

    it('attempts to login', () => {
        const component = shallow(<LoginScreen />);
        const instance = component.instance();
        expect(instance.state.didAttemptLogin).toBeFalsy();
        instance.attemptSignIn();

        expect(auth.signInWithGoogleAsync).toHaveBeenCalled();
        expect(instance.state.didAttemptLogin).toBeTruthy();
    });
});