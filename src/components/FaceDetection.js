/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react'
import * as faceapi from 'face-api.js'
import {api} from '../utils/api'

	const FaceDetection = ({ data, available }) => {
	const videoRef = useRef()
	const canvasRef = useRef()
	const [DetectedFace, setDetectedFace] = useState({})
	const [Present, setPresent] = useState([])
	const [person,setPerson] = useState('')

	const useTiny = true
	let initialized = false
	const inputSize = 512
	const scoreThreshold = 0.5
	const minConfidence = 0.7
	const label = 'Name  Satwik Prabhu'
	const availableExpressions = ['neutral', 'happy', 'surprised']
	let objExpressionDescriptors = {}
	const getImageLabel = api.user.getLabelImages.useQuery();

	useEffect(() => {
		const loadModels = async () => {
			const url ='/models'
			await Promise.all([
			 faceapi.loadTinyFaceDetectorModel(url),
			 faceapi.loadFaceLandmarkTinyModel(url),
			 faceapi.loadFaceExpressionModel(url),
			 faceapi.loadFaceRecognitionModel(url),
			]); 
		}
		loadModels()
		getVideo()
	}, [])

	const dimensions = {
		width: 800,
		height: 600,
	}

	const getVideo = () => {
		navigator.mediaDevices
			.getUserMedia({ video: dimensions })
			.then(stream => {
				videoRef.current.srcObject = stream
			})
			.catch(err => {
				console.error('error:', err)
			})
			console.log('Video loaded')
	}

	const detect = async () => {
		// cn
		const refFace = await loadLabeledImages()
		const faceMatcher = new faceapi.FaceMatcher(refFace, minConfidence)
		
		setInterval(async () => {
			// .detectSingleFace(videoRef.current, new faceapi.getFaceDetectorOptions())
			const detection = await faceapi
				.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
				.withFaceLandmarks(useTiny)
				.withFaceExpressions()
				.withFaceDescriptor()

			if (detection) {
				const resizedDetections = faceapi.resizeResults(detection, dimensions)
				


				Object.keys(resizedDetections.expressions).forEach(key => {
					if (availableExpressions.indexOf(key) < 0) return // skip if other expressions
					if (resizedDetections.expressions[key] > minConfidence && initialized === false)
						if (!objExpressionDescriptors.hasOwnProperty(key)) {
							// console.log('Detection:', JSON.stringify(detection))
							// console.log('Resized Detections:', key, JSON.stringify(resizedDetections.descriptor))

							// check if face expression not fulfilled yet
							objExpressionDescriptors[key] = resizedDetections.descriptor // update fullfilled face expressions
							// trigger event each new expression detected
							console.log('Expression:', key, 'Detected')
							// if (hasAllExpressions()) {
								//Add to the database or compare to the database
								console.log(
									'All 3 Expressions',
									JSON.stringify(Object.values(objExpressionDescriptors))
								)
								// console.log('Detection', detection)
								initialized = true

								// cn
								// const arr = [...Object.values(objExpressionDescriptors)]
								// const results = arr.map(d => {
								// 	return faceMatcher.findBestMatch(d.descriptor)
								// })
								const result = faceMatcher.findBestMatch(resizedDetections.descriptor)
								console.log('RESULT=>', result.toString())

								const options = { label: result.toString(), lineWidth: 3 }
								if (result) {
									const students = [...Present]
									students.unshift(` ${result.toString()} is present.`)
									setPresent(students)
									setPerson(result.toString())
									showDetections(detection, result.toString())

									async function submitAttendance() {
									 const response = await fetch('/api/submit',{
										method:'POST',
										headers:{
											'Accept':'application/json',
											'Content-Type':'application/json'
										},
										body: JSON.stringify({ labell: result.toString() })
									}) 
									const content = await response.json()
									console.log(content);
									alert("Suceess: Attendance Marked!");
								}
								submitAttendance();
									// console.log('Present----------', JSON.stringify(Present))


								}

								const drawBox = new faceapi.draw.DrawBox(resizedDetections.detection.box, options)
								drawBox.draw(canvasRef.current)

								setDetectedFace(prev => {
									// Update state
									return { details: Object.values(objExpressionDescriptors) }
								})

								const descriptors = [...Object.values(objExpressionDescriptors)]
								console.log('Descriptors:::', JSON.stringify(descriptors))
								if (available === false) addStudent(descriptors) // ANCHOR database
							// }
						}
				})
			}
			if (detection !== undefined) showDetections(detection, Present[0])
		}, 3000)
	}

	const hasAllExpressions = () => {
		return availableExpressions.every(expression => {
			return objExpressionDescriptors.hasOwnProperty(expression)
		})
	}

	function loadLabeledImages() {
		const labels = getImageLabel.data
		// const labels = ["Satwik Prabhudfdf"]
		return Promise.all(
			labels.map(async label => {
				const image = label.pic;
				const descriptions = []
				for (let i = 0; i < labels.length; i++) {
					const img = await faceapi.fetchImage(image);
					const detections = await faceapi
						.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
						.withFaceLandmarks(useTiny)
						.withFaceExpressions()
						.withFaceDescriptor()

					// console.log(label + i + JSON.stringify(detections.descriptor))
					descriptions.push(detections.descriptor)
				}
				return new faceapi.LabeledFaceDescriptors(label.labels, descriptions)
			})
		)
	}

	const showDetections = (detection, label) => {
		faceapi.matchDimensions(canvasRef.current, dimensions)
		const resizedDetections = faceapi.resizeResults(detection, dimensions)
		const minProbability = 0.05
		canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current)
		canvasRef.current.getContext('2d').clearRect(0, 0, dimensions.width, dimensions.height)

		// cc // default label
		const options = { label: label || 'Analyzing Face', lineWidth: 3 }
		const drawBox = new faceapi.draw.DrawBox(resizedDetections.detection.box, options)
		drawBox.draw(canvasRef.current)

		faceapi.draw.drawDetections(canvasRef.current, resizedDetections)
		faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections)
		faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections, minProbability)
	}
	const addStudent = async descriptors => {
		let db
		console.log("added to local storage")
		if (localStorage.getItem('db') == null) {
			console.log('NO db')
			db = []
			localStorage.setItem('db', JSON.stringify(db))
		}
		// db = JSON.parse(localStorage.getItem('db'))


		if (db != null) {
			let label = await prompt('Enter your username', 'Satwik Prabhu')
			const data = { label: label, descriptors: JSON.stringify(descriptors) }
			db.push(data)
			localStorage.setItem('db', db)
			// console.log('db updated:=>', JSON.stringify(localStorage.getItem('db')))
		}
	}

	function List() {
		return <ol>{() => Present.map(name => <li key={name}>{name} is present.</li>)}</ol>
	}

	return (
		<section className='flex flex-col justify-center items-center relative'>
    <div className="flex justify-center relative">
        <video autoPlay muted ref={videoRef} onPlay={detect} width={700} className='rounded-xl z-10' style={{ position: 'relative' }} />
        <canvas ref={canvasRef} className='absolute top-0 left-0 w-full h-full z-20' style={{ width: '100%', height: '100%' }}/>
    </div>
    <div className="flex justify-center items-center mt-4">
        <h2 className='font-bold text-xl'>Students Present</h2>
        <div>{person}</div>
    </div>
</section>

	)
}

export default FaceDetection
