import React, { Component } from 'react'

/** Import UI Elements */

import { makeStyles, withStyles } from '@material-ui/core/styles';
import { red, green, blue } from '@material-ui/core/colors';

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import CircularProgress from '@material-ui/core/CircularProgress';
import Switch from '@material-ui/core/Switch';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import Zoom from '@material-ui/core/Zoom';

import Radio from '@material-ui/core/Radio';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';

import SettingsBrightnessIcon from '@material-ui/icons/SettingsBrightness';

const Color = require('color')

const getXY = (red, green, blue) => {

  if (red > 0.04045){ 
    red = Math.pow((red + 0.055) / (1.0 + 0.055), 2.4);
  }else{
    red = (red / 12.92);
  }
  
  if (green > 0.04045){
    green = Math.pow((green + 0.055) / (1.0 + 0.055), 2.4);
  }else{
    green = (green / 12.92);
  }
  
  if (blue > 0.04045){
    blue = Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4);
  }else{
    blue = (blue / 12.92);
  }
  
  let X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  let Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
  let Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;
  let x = X / (X + Y + Z);
  let y = Y / (X + Y + Z);

  return new Array(Math.round(x * 1e4) / 1e4, Math.round(y * 1e4) / 1e4);
  
}

const colorToXY = (color, jsonify = false) => {

  let colorRGB = Color(color).rgb().color

  if(jsonify) {

    return JSON.stringify(getXY(colorRGB[0], colorRGB[1], colorRGB[2])).replace(/['"]+/g, '')

  }else{

    return getXY(colorRGB[0], colorRGB[1], colorRGB[2])

  }

}

export default class BridgeSync extends Component {

  constructor(props) {

    super(props);
    
    this.state = {
      bridge: undefined,
      username: undefined,
      lights: undefined
    }

  }

  

  componentDidMount() {

    const bridge = localStorage.getItem('bridge') || this.state.bridge
    const username = localStorage.getItem('username') || this.state.username
    const lights = JSON.parse(localStorage.getItem('lights')) || this.state.lights
    this.setState({ bridge, username, lights })

    if(!bridge || !username) {

      this.bridgeSearch()

    }else if(!lights || !Object.keys(lights).length) {

      this.updateLightData()

    }

  }

  updateLightData = () => {

    const Handler = this
    const HueAPI = require('philips-hue')
    const Hue = new HueAPI

    Hue.bridge = localStorage.getItem('bridge')
    Hue.username = localStorage.getItem('username')

    Hue.getLights().then(lights => {

      Handler.setState(state => ({ lights: lights }))
      localStorage.setItem('lights', JSON.stringify(lights))

    }).catch(err => {

      console.error('Error: ', err)

    })

  }

  bridgeSearch = () => {

    const Handler = this
    const HueAPI = require('philips-hue')
    const Hue = new HueAPI()

    Hue.getBridges().then(bridges => {

      Handler.setState(state => ({ bridge: bridges[0] }))
      localStorage.setItem('bridge', bridges[0])

      let promise = Promise.resolve(true)

      let connectionInterval = setInterval(() => {

        promise = Hue.auth(bridges[0]).then(authenticated => {

          return new Promise(resolve => {

            clearInterval(connectionInterval)

            Handler.setState(state => ({ username: authenticated }))
            localStorage.setItem('username', authenticated)

            this.updateLightData()
            
          })

        })

      }, 1000)
  
    }).catch(err => {

      console.error('Error: ', err)
    
    })

  }

  toggleLightState = (event, light) => {

    const Handler = this
    const HueAPI = require('philips-hue')
    const Hue = new HueAPI

    Hue.bridge = Handler.state.bridge
    Hue.username = Handler.state.username

    if(light.state) {

      Hue.light(light.key).off().then(() => {

        Handler.updateLightData()

      }).catch(err => {

        console.error('Error: ', err)

      });

    }else{

      Hue.light(light.key).on().then(() => {

        Handler.updateLightData()

      }).catch(err => {

        console.error('Error: ', err)

      });

    }

  }


  updateLightBrightnessSlider = (event, light) => {

    console.log(event)
    console.log(light)

  }


  updateLightBrightnessInput = (event, light) => {

    const Handler = this
    const HueAPI = require('philips-hue')
    const Hue = new HueAPI

    Hue.bridge = Handler.state.bridge
    Hue.username = Handler.state.username

    if(light.state) {

      let value = Math.round(((event.target.value*255) / 100))

      value = value > 255 ? 255 : value
      value = value < 10 ? 10 : value

      Hue.light(light.key).setState({bri: value}).then(() => {

        Handler.updateLightData()
  
      }).catch(err => {
  
        console.error('Error: ', err)
  
      });

    }

  }


  updateLightColor = (event, light) => {

    const Handler = this
    const HueAPI = require('philips-hue')
    const Hue = new HueAPI

    Hue.bridge = Handler.state.bridge
    Hue.username = Handler.state.username

    if(light.state.on) {

      let colorXY = colorToXY(event.target.getAttribute('color'))

      console.log(colorXY)

      Hue.light(light.key).setState({xy: colorXY}).then(() => {

        Handler.updateLightData()
  
      }).catch(err => {
  
        console.error('Error: ', err)
  
      });

    }

  }


  render() {

    const lights = []

    for (let key in this.state.lights) {

      let light = this.state.lights[key]

      let value = Math.round(((light.state.bri*100) / 255))

      const RedRadio = withStyles({
        root: {
          color: red[400],
          '&$checked': {
            color: red[600],
          },
        },
        checked: {},
      })(props => <Radio color="default" {...props} />);

      const GreenRadio = withStyles({
        root: {
          color: green[400],
          '&$checked': {
            color: green[600],
          },
        },
        checked: {},
      })(props => <Radio color="default" {...props} />);

      const BlueRadio = withStyles({
        root: {
          color: blue[400],
          '&$checked': {
            color: blue[600],
          },
        },
        checked: {},
      })(props => <Radio color="default" {...props} />);

      lights.push(
        <Grid key={key} item xs={12}>
          <Zoom in={true} timeout={key*200}>
            <Card>
              <CardHeader
                avatar={
                  <Switch
                    color="primary"
                    checked={light.state.on}
                    onChange={(e) => {
                      this.toggleLightState(e, {key: key, state: light.state.on})
                    }}
                    value={key}
                  />
                }
                // action={
                //   <IconButton aria-label="settings">
                //     <MoreVertIcon />
                //   </IconButton>
                // }
                title={
                  <strong>{light.name}</strong>
                }
                subheader={light.productname}
              />
                
                {light.state.ff &&
                  <CardContent>
                    <RedRadio 
                    inputProps={{color: red[500], xy: JSON.stringify(light.state.xy)}} 
                    value={colorToXY(red[500], true)} 
                    checked={colorToXY(red[500], true) == JSON.stringify(light.state.xy)}
                    name={"color-" + key} 
                    onChange={(e) => {
                      this.updateLightColor(e, {key: key, state: light.state})
                    }}/>

                    <GreenRadio 
                    inputProps={{color: green[500], xy: JSON.stringify(light.state.xy)}} 
                    value={colorToXY(green[500], true)} 
                    checked={colorToXY(green[500], true) === JSON.stringify(light.state.xy)}
                    name={"color-" + key} 
                    onChange={(e) => {
                      this.updateLightColor(e, {key: key, state: light.state})
                    }}/>

                    <BlueRadio 
                    inputProps={{color: blue[500], xy: JSON.stringify(light.state.xy)}} 
                    value={colorToXY(blue[500], true)} 
                    checked={colorToXY(blue[500], true) === JSON.stringify(light.state.xy)}
                    name={"color-" + key} 
                    onChange={(e) => {
                      this.updateLightColor(e, {key: key, state: light.state})
                    }}/>

                    <Grid container alignItems="center" spacing={3}>
                      <Grid item xs={2}>
                        <SettingsBrightnessIcon/>
                      </Grid>
                      <Grid item xs={7}>
                        <Slider name={key} value={value} aria-labelledby="continuous-slider" onChange={(e) => {
                          this.updateLightBrightnessSlider(e, {key: key, state: light.state.on})
                        }} />
                      </Grid>
                      <Grid item xs={3}>
                        <Input
                          value={value}
                          margin="dense"
                          onChange={(e) => {
                            this.updateLightBrightnessInput(e, {key: key, state: light.state.on})
                          }}
                          inputProps={{
                            step: 10,
                            min: 10,
                            max: 100,
                            type: 'number'
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                }
            </Card>
          </Zoom>
        </Grid>
      )

    }

    if(this.state.bridge && this.state.username) {

      return (
        <Grid container spacing={3}>
          {lights}
        </Grid>
      );

    }else{

      return (
        <div>
          <CircularProgress />
        </div>
      );

    }

  }

}