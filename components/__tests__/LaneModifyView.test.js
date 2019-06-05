import React from 'react'
import Enzyme, {shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import renderer from 'react-test-renderer';
import { Permissions } from 'expo';

import ImageBrowser from 'lane/components/image_picker/ImageBrowser';

import LaneModifyView from '../LaneModifyView'

jest.mock('lane/components/image_picker/ImageBrowser', () => 'imagebrowser' );

jest.mock('expo', () => ({
    Permissions: {
        askAsync: jest.fn(),
    }
}));

Enzyme.configure({ adapter: new Adapter() });

describe('LaneModifyView', () => {
    const setup = () => {
        const component = shallow(<LaneModifyView/>);
        const instance = component.instance();
        return { component, instance };
    }

    beforeEach(() => {
        Permissions.askAsync.mockReset();
    });

    it('renders empty create screen correctly', () => {
        const { component, instance } = setup();
        const screen = renderer.create(instance.render()).toJSON();
        const imageBrowser = renderer.create(instance.renderImageBrowser()).toJSON();

        expect(screen).toMatchSnapshot();
        expect(screen).not.toEqual(imageBrowser);
    });

    it('renders top nav correctly', () => {
        const { component, instance } = setup();
        const topNav = renderer.create(instance.renderTopNav()).toJSON();

        expect(topNav).toMatchSnapshot();
    });

    it('renders color modal correctly', () => {
        const { component, instance } = setup();
        const colorModal = renderer.create(instance.renderColorModal()).toJSON();

        expect(colorModal).toMatchSnapshot();
    });

    it('renders image browser if image_browser_open is true in state', () => {
        const { component, instance } = setup();
        const imageBrowser = renderer.create(instance.renderImageBrowser()).toJSON();

        instance.state.imageBrowserOpen = true;
        const screen = renderer.create(instance.render()).toJSON();

        expect(screen).toEqual(imageBrowser);
    });

    it('alerts if permissions throws error', () => {
        Permissions.askAsync.mockImplementation( permission => { throw 'lolol'; } );
        const { component, instance } = setup();

        return instance.handleAddPhotos().then(data => {
            expect(Permissions.askAsync).toHaveBeenCalled();
            expect(instance.state.snackVisible).toBeTruthy();
        });
    });

    it('alerts if permissions returns false', () => {
        Permissions.askAsync.mockImplementation( permission => { return {status: 'error'} } );
        const { component, instance } = setup();

        return instance.handleAddPhotos().then(data => {
            expect(Permissions.askAsync).toHaveBeenCalled();
            expect(instance.state.snackVisible).toBeTruthy();
        });
    });

    it('opens image browser if permissions returns true', () => {
        Permissions.askAsync.mockImplementation( permission => { return {status: 'granted'} } );
        const { component, instance } = setup();

        return instance.handleAddPhotos().then( () => {
            expect(Permissions.askAsync).toHaveBeenCalled();
            expect(instance.state.snackVisible).toBeFalsy();
            expect(instance.state.imageBrowserOpen).toBeTruthy();
        });
    });

    it('adds selected photos to state', () => {
        const { component, instance } = setup();
        const photos = [{image: { uri: 'uri1', width: 100, height: 100 }}, {image: { uri: 'uri2',  width: 100, height: 100 }}];
        const photoPromise = Promise.all([]).then( () => {
            return photos;
        });

        instance.imageBrowserCallback(photoPromise);
        photoPromise.then( () => {
            expect(instance.state.imageBrowserOpen).toBeFalsy();
            expect(instance.state.photos).toEqual(photos);
        });
    });

    it('adds additional photos to state', () => {
        const { component, instance } = setup();
        const photos = [{image: { uri: 'uri1', width: 100, height: 100 }}, {image: { uri: 'uri2',  width: 100, height: 100 }}];
        const photoPromise = Promise.all([]).then( () => {
            return photos;
        });
        instance.imageBrowserCallback(photoPromise);
        instance.imageBrowserCallback(photoPromise);

        photoPromise.then( () => {
            expect(instance.state.imageBrowserOpen).toBeFalsy();
            expect(instance.state.photos).toEqual([...photos, ...photos]);
        });
    });

    it('removes photo from state', () => {
        const { component, instance } = setup();
        const photos = [{image: { uri: 'uri1', width: 100, height: 100 }}, {image: { uri: 'uri2',  width: 100, height: 100 }}];
        const photoPromise = Promise.all([]).then( () => {
            return photos;
        });
        instance.imageBrowserCallback(photoPromise);

        photoPromise.then( () => {
            instance.removePhoto('uri1');
            expect(instance.state.photos).toEqual([photos[1]]);
        });
    });
});