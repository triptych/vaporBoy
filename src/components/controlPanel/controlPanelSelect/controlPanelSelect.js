import { Component } from "preact";
import { WasmBoy } from "wasmboy";

import { Pubx } from "../../../services/pubx";
import { PUBX_CONFIG } from "../../../pubx.config";

import { NOTIFICATION_MESSAGES } from "../../../notification.messages";

import ROMSourceSelector from "../ROMSourceSelector/ROMSourceSelector";
import LoadStateList from "../loadStateList/loadStateList";
import VaporBoyOptions from "../vaporBoyOptions/vaporBoyOptions";
import VaporBoyEffects from "../vaporBoyEffects/vaporBoyEffects";

export default class ControlPanelSelect extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    // Subscribe to our save states for enabling/disabling loading
    const pubxSaveStatesSubscriberKey = Pubx.subscribe(
      PUBX_CONFIG.SAVES_STATES_KEY,
      newState => {
        this.setState({
          ...this.state,
          saveStates: {
            ...this.state.saveStates,
            ...newState
          }
        });
      }
    );

    this.setState({
      collection: {
        ...Pubx.get(PUBX_CONFIG.ROM_COLLECTION_KEY)
      },
      saveStates: {
        ...Pubx.get(PUBX_CONFIG.SAVES_STATES_KEY)
      },
      controlPanel: {
        ...Pubx.get(PUBX_CONFIG.CONTROL_PANEL_KEY)
      },
      pubxSaveStatesSubscriberKey
    });
  }

  componentWillUnmount() {
    // unsubscribe from the state
    Pubx.unsubscribe(
      PUBX_CONFIG.SAVES_STATES_KEY,
      this.state.pubxSaveStatesSubscriberKey
    );
  }

  shouldDisableLoadStates() {
    if (!WasmBoy.isReady()) {
      return true;
    }

    if (!this.state.saveStates || !this.state.saveStates.saveStates) {
      return true;
    }

    return false;
  }

  saveState() {
    WasmBoy.saveState()
      .then(() => {
        WasmBoy.play()
          .then(() => {
            this.state.controlPanel.hideControlPanel();
            Pubx.get(PUBX_CONFIG.NOTIFICATION_KEY).showNotification(
              NOTIFICATION_MESSAGES.SAVE_STATE
            );
          })
          .catch(() => {
            Pubx.get(PUBX_CONFIG.NOTIFICATION_KEY).showNotification(
              `${NOTIFICATION_MESSAGES.SAVE_STATE} ${
                NOTIFICATION_MESSAGES.ERROR_RESUME_ROM
              }`
            );
          });
      })
      .catch(() => {
        Pubx.get(PUBX_CONFIG.NOTIFICATION_KEY).showNotification(
          NOTIFICATION_MESSAGES.ERROR_SAVE_STATE
        );
      });
  }

  viewROMSourceSelector() {
    this.state.controlPanel.addComponentToControlPanelViewStack(
      "ROM Source",
      <ROMSourceSelector />
    );
  }

  viewLoadStateList() {
    this.state.controlPanel.addComponentToControlPanelViewStack(
      "Load State",
      <LoadStateList />
    );
  }

  viewOptions() {
    this.state.controlPanel.addComponentToControlPanelViewStack(
      "Options",
      <VaporBoyOptions />
    );
  }

  viewEffects() {
    this.state.controlPanel.addComponentToControlPanelViewStack(
      "Effects",
      <VaporBoyEffects />
    );
  }

  playROM() {
    WasmBoy.play();
    this.state.controlPanel.hideControlPanel();
    Pubx.get(PUBX_CONFIG.NOTIFICATION_KEY).showNotification(
      NOTIFICATION_MESSAGES.RESUME_ROM
    );
  }

  pauseROM() {
    WasmBoy.pause();
    this.state.controlPanel.hideControlPanel();
    Pubx.get(PUBX_CONFIG.NOTIFICATION_KEY).showNotification(
      NOTIFICATION_MESSAGES.PAUSE_ROM
    );
  }

  render() {
    let playPause = (
      <button onclick={() => this.playROM()} disabled={!WasmBoy.isReady()}>
        <div>▶️</div>
        <div>Resume Playing</div>
      </button>
    );
    if (WasmBoy.isPlaying()) {
      playPause = (
        <button onclick={() => this.pauseROM()} disabled={!WasmBoy.isReady()}>
          <div>⏸️</div>
          <div>Pause ROM</div>
        </button>
      );
    }

    return (
      <div class="control-panel-select">
        <ul class="control-panel-select__grid">
          <li class="control-panel-select__grid__item">
            <button onclick={() => this.viewROMSourceSelector()}>
              <div>🎮</div>
              <div>Select a ROM</div>
            </button>
          </li>
          <li class="control-panel-select__grid__item">
            <button
              onclick={() => this.saveState()}
              disabled={!WasmBoy.isReady()}
            >
              <div>💾</div>
              <div>Save State</div>
            </button>
          </li>
          <li class="control-panel-select__grid__item">
            <button
              onclick={() => this.viewLoadStateList()}
              disabled={this.shouldDisableLoadStates()}
            >
              <div>📂</div>
              <div>Load State</div>
            </button>
          </li>
          <li class="control-panel-select__grid__item">
            <button onclick={() => this.viewOptions()}>
              <div>⚙️</div>
              <div>Configure Options</div>
            </button>
          </li>
          <li class="control-panel-select__grid__item">
            <button onclick={() => this.viewEffects()}>
              <div>✨</div>
              <div>Configure Effects</div>
            </button>
          </li>
          <li class="control-panel-select__grid__item">{playPause}</li>
        </ul>
      </div>
    );
  }
}
