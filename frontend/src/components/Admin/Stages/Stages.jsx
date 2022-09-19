import React, { useEffect, useState } from 'react'
import { Button, Container, Form, Grid, Header, Segment, Icon } from 'semantic-ui-react'

import { COLOR_LIST, COLOR_LIST_SELECT, COLOR_LIST_SELECT_ENG } from '../Consts'

export default function StageCreation({ stage, headerPageIcon, sendStage, closeModal }) {
  const [id, setId] = useState(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [active, setActive] = useState(0)

  useEffect(() => {
    setId(stage.stage_id)
    setName(stage.stage_name)
    setColor(COLOR_LIST.indexOf(stage.stage_color))
    setActive(stage.stage_active)
  }, [stage])

  const sendData = async () => {
    // Close modal
    closeModal()

    // Insert and Update have the same parameters, so we use the same function
    // When we update we pass the stage_id
    await sendStage(
      {
        stage_color: COLOR_LIST_SELECT_ENG[color].text,
        stage_active: Number(active),
      },
      id
    )
  }

  return (
    <Container>
      <Header as="h1">
        <Icon circular inverted name={headerPageIcon} />
        Modificar Versión
      </Header>
      <Grid>
        <Grid.Column>
          <Form size="small">
            <Segment raised>
              <Form.Input
                fluid
                required
                readOnly
                label="Nombre"
                placeholder="Nombre..."
                name="stage_name"
                value={name}
                onChange={(e, { value }) => setName(value)}
              />
              <Form.Dropdown
                fluid
                selection
                required
                label="Color"
                placeholder="Color..."
                name="stage_color"
                options={COLOR_LIST_SELECT}
                value={color}
                onChange={(e, { value }) => setColor(value)}
              />
              <Form.Checkbox
                fluid
                toggle
                required
                label="Versión Activa"
                name="stage_active"
                checked={active}
                onClick={() => setActive(!active)}
              />
              <br />
              <Button color="teal" fluid size="large" onClick={() => sendData()}>
                Guardar
              </Button>
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    </Container>
  )
}
