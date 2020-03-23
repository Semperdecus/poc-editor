const AppDefinition = `name: Unlittered App
description: An app in which litter can be reported and displayed on an interactive map.
defaultPage: Report litter

theme:
  themeColor: '#eb0000'
  splashColor: '#ffffff'
  primaryColor: '#eb0000'

resources:
  litter:
    schema:
      type: object
      required:
        - notes
        - process
      properties:
        notes:
          type: string
          title: Notes
        photos:
          type: array
          items:
            type: string
            appsembleFile:
              type:
                - image/jpeg
          title: Photos
        process:
          enum:
            - Bicycle Collection
            - Maintenance
            - Biodegradable Waste
            - Collection
          title: Process
        location:
          type: object
          title: GeoCoordinates
          required:
            - latitude
            - longitude
          properties:
            latitude:
              type: number
            longitude:
              type: number

pages:
  - name: Report litter
    blocks:
      - type: form
        version: 0.11.6
        parameters:
          fields:
            - name: location
              type: geocoordinates
              label: Location
            - type: enum
              enum:
                - value: Bicycle Collection
                - value: Maintenance
                - value: Biodegradable Waste
                - value: Collection
              name: process
              label: Process
            - name: notes
              type: string
              label: Notes
              multiline: true
              placeholder: 'Example: There is a bicycle in the bushes'
            - name: photos
              type: file
              label: Photos
              accept:
                - image/jpeg
              repeated: true
        actions:
          onSubmit:
            type: resource.create
            resource: litter
          onSubmitSuccess:
            type: link
            to: Litter Overview

  - name: Litter Overview
    blocks:
      - type: data-loader
        version: 0.11.6
        actions:
          onLoad:
            type: resource.query
            resource: litter
            query:
              '$orderby': '$created desc'
              '$top': 50
        events:
          emit:
            data: data
      - type: map
        version: 0.11.6
        parameters:
          latitude: location.latitude
          longitude: location.longitude
        actions:
          onMarkerClick:
            to: Litter details
            type: link
        events:
          listen:
            data: data
      - type: action-button
        version: 0.11.6
        parameters:
          icon: plus
        actions:
          onClick:
            to: Report litter
            type: link

  - name: Litter details
    parameters:
      - id
    blocks:
      - type: data-loader
        version: 0.11.6
        actions:
          onLoad:
            type: resource.get
            resource: litter
        events:
          emit:
            data: data
      - type: detail-viewer
        version: 0.11.6
        parameters:
          fileBase: 'https://appsemble.app/api/apps/14/assets'
          fields:
            - name: location
              type: geocoordinates
              label: Location
              latitude: latitude
              longitude: longitude
            - name: process
              label: Process
            - name: notes
              label: Notes
            - name: photos
              type: file
              label: Photos
              repeated: true
        events:
          listen:
            data: data`;

export default AppDefinition;
