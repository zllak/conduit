import _ from 'lodash';
import { expect } from 'chai';
import { mount } from 'enzyme';
import multiDeployRollupFixtures from './fixtures/multiDeployRollup.json';
import podFixtures from './fixtures/pods.json';
import { routerWrap } from './testHelpers.jsx';
import ServiceMesh from '../js/components/ServiceMesh.jsx';
import sinon from 'sinon';
import sinonStubPromise from 'sinon-stub-promise';

sinonStubPromise(sinon);

describe('ServiceMesh', () => {
  let component, fetchStub;

  function withPromise(fn) {
    return component.find("ServiceMesh").get(0).serverPromise.then(fn);
  }

  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch');
  });

  afterEach(() => {
    window.fetch.restore();
  });

  it("displays an error if the api call didn't go well", () => {
    let errorMsg = "Something went wrong!";

    fetchStub.returnsPromise().resolves({
      ok: false,
      statusText: errorMsg
    });
    component = mount(routerWrap(ServiceMesh));

    return withPromise(() => {
      expect(component.html()).to.include(errorMsg);
    });
  });

  it("renders the spinner before metrics are loaded", () => {
    fetchStub.returnsPromise().resolves({
      ok: true,
      json: () => Promise.resolve({ metrics: [] })
    });
    component = mount(routerWrap(ServiceMesh));

    expect(component.find("ConduitSpinner")).to.have.length(1);
    expect(component.find("ServiceMesh")).to.have.length(1);
    expect(component.find("CallToAction")).to.have.length(0);
  });

  it("renders a call to action if no metrics are received", () => {
    fetchStub.returnsPromise().resolves({
      ok: true,
      json: () => Promise.resolve({ metrics: [] })
    });
    component = mount(routerWrap(ServiceMesh));

    return withPromise(() => {
      expect(component.find("ServiceMesh")).to.have.length(1);
      expect(component.find("ConduitSpinner")).to.have.length(0);
      expect(component.find("CallToAction")).to.have.length(1);
    });
  });

  it("renders controller component summaries", () => {
    let addedPods = _.cloneDeep(podFixtures.pods);
    _.set(addedPods[0], "added", true);

    fetchStub.returnsPromise().resolves({
      ok: true,
      json: () => Promise.resolve({ metrics: multiDeployRollupFixtures.metrics, pods: addedPods})
    });
    component = mount(routerWrap(ServiceMesh));

    return withPromise(() => {
      expect(component.find("ServiceMesh")).to.have.length(1);
      expect(component.find("ConduitSpinner")).to.have.length(0);
      expect(component.find("DeploymentSummary")).to.have.length(3);
    });
  });

  it("renders service mesh details section", () => {
    fetchStub.returnsPromise().resolves({
      ok: true,
      json: () => Promise.resolve({ metrics: [] })
    });
    component = mount(routerWrap(ServiceMesh));

    return withPromise(() => {
      expect(component.find("ServiceMesh")).to.have.length(1);
      expect(component.find("ConduitSpinner")).to.have.length(0);
      expect(component.html()).includes("Service mesh details");
      expect(component.html()).includes("Conduit version");
    });
  });

  it("renders control plane section", () => {
    fetchStub.returnsPromise().resolves({
      ok: true,
      json: () => Promise.resolve({ metrics: [] })
    });
    component = mount(routerWrap(ServiceMesh));

    return withPromise(() => {
      expect(component.find("ServiceMesh")).to.have.length(1);
      expect(component.find("ConduitSpinner")).to.have.length(0);
      expect(component.html()).includes("Control plane");
    });
  });

  it("renders data plane section", () => {
    fetchStub.returnsPromise().resolves({
      ok: true,
      json: () => Promise.resolve({ metrics: [] })
    });
    component = mount(routerWrap(ServiceMesh));

    return withPromise(() => {
      expect(component.find("ServiceMesh")).to.have.length(1);
      expect(component.find("ConduitSpinner")).to.have.length(0);
      expect(component.html()).includes("Data plane");
    });
  });

  describe("renderAddDeploymentsMessage", () => {
    it("displays when no deployments are in the mesh", () => {
      fetchStub.returnsPromise().resolves({
        ok: true,
        json: () => Promise.resolve({ pods: []})
      });
      component = mount(routerWrap(ServiceMesh));

      return withPromise(() => {
        expect(component.html()).to.include("No deployments detected.");
      });
    });

    it("displays a message if >1 deployment has not been added to the mesh", () => {
      fetchStub.returnsPromise().resolves({
        ok: true,
        json: () => Promise.resolve({ pods: podFixtures.pods})
      });
      component = mount(routerWrap(ServiceMesh));

      return withPromise(() => {
        expect(component.html()).to.include("deployments have not been added to the service mesh.");
      });
    });

    it("displays message if 1 deployment has not added to servicemesh", () => {
      let addedPods = _.cloneDeep(podFixtures.pods);
      _.set(addedPods[0], "added", true);

      fetchStub.returnsPromise().resolves({
        ok: true,
        json: () => Promise.resolve({ pods: addedPods})
      });
      component = mount(routerWrap(ServiceMesh));

      return withPromise(() => {
        expect(component.html()).to.include("1 deployment has not been added to the service mesh.");
      });
    });

    it("displays message if all deployments have been added to servicemesh", () => {
      let addedPods = _.cloneDeep(podFixtures.pods);
      _.forEach(addedPods, pod => {
        _.set(pod, "added", true);
      });

      fetchStub.returnsPromise().resolves({
        ok: true,
        json: () => Promise.resolve({ pods: addedPods})
      });
      component = mount(routerWrap(ServiceMesh));

      return withPromise(() => {
        expect(component.html()).to.include("All deployments have been added to the service mesh.");
      });
    });
  });
});
